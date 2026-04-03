-- New normalized schema for recipes, pantry and meal planner.
-- Safe to run multiple times (uses IF NOT EXISTS / DROP POLICY IF EXISTS).

create extension if not exists pgcrypto;

-- Enums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'meal_slot') THEN
    CREATE TYPE public.meal_slot AS ENUM ('breakfast', 'brunch', 'lunch', 'snack', 'dinner');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pantry_status') THEN
    CREATE TYPE public.pantry_status AS ENUM ('available', 'assigned', 'eaten', 'discarded');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pantry_storage') THEN
    CREATE TYPE public.pantry_storage AS ENUM ('fresh', 'fridge', 'frozen');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pantry_appliance') THEN
    CREATE TYPE public.pantry_appliance AS ENUM ('air_fryer', 'oven', 'microwave', 'stove', 'grill');
  END IF;
END$$;

-- Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Recipes domain
CREATE TABLE IF NOT EXISTS public.recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  photo_url text,
  prep_minutes integer,
  cook_minutes integer,
  servings integer,
  tags text[],
  type public.meal_slot NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT recipes_prep_minutes_non_negative CHECK (prep_minutes IS NULL OR prep_minutes >= 0),
  CONSTRAINT recipes_cook_minutes_non_negative CHECK (cook_minutes IS NULL OR cook_minutes >= 0),
  CONSTRAINT recipes_servings_positive CHECK (servings IS NULL OR servings > 0)
);

CREATE TABLE IF NOT EXISTS public.ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  default_unit text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.recipe_ingredients (
  recipe_id uuid NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  ingredient_id uuid NOT NULL REFERENCES public.ingredients(id) ON DELETE RESTRICT,
  quantity numeric,
  unit text,
  note text,
  PRIMARY KEY (recipe_id, ingredient_id)
);

CREATE TABLE IF NOT EXISTS public.recipe_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  step_number integer NOT NULL,
  instruction text NOT NULL,
  photo_url text,
  CONSTRAINT recipe_steps_number_positive CHECK (step_number > 0),
  CONSTRAINT recipe_steps_unique_position UNIQUE (recipe_id, step_number)
);

-- Pantry domain
CREATE TABLE IF NOT EXISTS public.pantry_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipe_id uuid REFERENCES public.recipes(id) ON DELETE SET NULL,
  quantity integer NOT NULL DEFAULT 1,
  status public.pantry_status NOT NULL DEFAULT 'available',
  storage public.pantry_storage,
  appliances public.pantry_appliance[] NOT NULL DEFAULT '{}',
  purchased_at date,
  best_before date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pantry_items_quantity_positive CHECK (quantity > 0)
);

-- Planner domain
CREATE TABLE IF NOT EXISTS public.meal_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_date date NOT NULL,
  slot public.meal_slot NOT NULL,
  recipe_id uuid REFERENCES public.recipes(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT meal_plans_unique_slot_per_day UNIQUE (user_id, plan_date, slot)
);

CREATE TABLE IF NOT EXISTS public.pantry_item_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pantry_item_id uuid NOT NULL REFERENCES public.pantry_items(id) ON DELETE CASCADE,
  meal_plan_id uuid NOT NULL REFERENCES public.meal_plans(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pantry_allocations_quantity_positive CHECK (quantity > 0)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at);

CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON public.recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_recipes_user_type ON public.recipes(user_id, type);
CREATE INDEX IF NOT EXISTS idx_recipes_updated_at ON public.recipes(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_ingredients_user_id ON public.ingredients(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_ingredients_unique_name_per_user
  ON public.ingredients(user_id, lower(name));

CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe_id ON public.recipe_ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_steps_recipe_id ON public.recipe_steps(recipe_id);

CREATE INDEX IF NOT EXISTS idx_pantry_items_user_id ON public.pantry_items(user_id);
CREATE INDEX IF NOT EXISTS idx_pantry_items_recipe_id ON public.pantry_items(recipe_id);
CREATE INDEX IF NOT EXISTS idx_pantry_items_status ON public.pantry_items(status);
CREATE INDEX IF NOT EXISTS idx_pantry_items_best_before ON public.pantry_items(best_before);

CREATE INDEX IF NOT EXISTS idx_meal_plans_user_id ON public.meal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_plan_date ON public.meal_plans(plan_date);
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_date ON public.meal_plans(user_id, plan_date);

CREATE INDEX IF NOT EXISTS idx_allocations_pantry_item_id ON public.pantry_item_allocations(pantry_item_id);
CREATE INDEX IF NOT EXISTS idx_allocations_meal_plan_id ON public.pantry_item_allocations(meal_plan_id);

-- Generic updated_at trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_recipes_set_updated_at ON public.recipes;
CREATE TRIGGER trg_recipes_set_updated_at
BEFORE UPDATE ON public.recipes
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_meal_plans_set_updated_at ON public.meal_plans;
CREATE TRIGGER trg_meal_plans_set_updated_at
BEFORE UPDATE ON public.meal_plans
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Allocation guard: cannot allocate more than pantry_items.quantity
CREATE OR REPLACE FUNCTION public.enforce_pantry_item_allocation_limit()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  target_pantry_item_id uuid;
  item_qty integer;
  allocated_qty integer;
BEGIN
  target_pantry_item_id := COALESCE(NEW.pantry_item_id, OLD.pantry_item_id);

  SELECT quantity INTO item_qty
  FROM public.pantry_items
  WHERE id = target_pantry_item_id;

  IF item_qty IS NULL THEN
    RAISE EXCEPTION 'Pantry item % not found', target_pantry_item_id;
  END IF;

  SELECT COALESCE(SUM(quantity), 0) INTO allocated_qty
  FROM public.pantry_item_allocations
  WHERE pantry_item_id = target_pantry_item_id
    AND (TG_OP <> 'UPDATE' OR id <> NEW.id);

  IF TG_OP IN ('INSERT', 'UPDATE') THEN
    allocated_qty := allocated_qty + NEW.quantity;
  END IF;

  IF allocated_qty > item_qty THEN
    RAISE EXCEPTION 'Allocation exceeds available quantity (% > %)', allocated_qty, item_qty;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_pantry_item_allocation_limit ON public.pantry_item_allocations;
CREATE TRIGGER trg_enforce_pantry_item_allocation_limit
BEFORE INSERT OR UPDATE ON public.pantry_item_allocations
FOR EACH ROW
EXECUTE FUNCTION public.enforce_pantry_item_allocation_limit();

-- Remaining view
CREATE OR REPLACE VIEW public.pantry_items_with_remaining AS
SELECT
  p.*,
  COALESCE(a.allocated_quantity, 0) AS allocated_quantity,
  GREATEST(p.quantity - COALESCE(a.allocated_quantity, 0), 0) AS remaining_quantity
FROM public.pantry_items p
LEFT JOIN (
  SELECT pantry_item_id, SUM(quantity)::integer AS allocated_quantity
  FROM public.pantry_item_allocations
  GROUP BY pantry_item_id
) a ON a.pantry_item_id = p.id;

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pantry_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pantry_item_allocations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
CREATE POLICY profiles_select_own ON public.profiles
FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
CREATE POLICY profiles_insert_own ON public.profiles
FOR INSERT WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own ON public.profiles
FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS profiles_delete_own ON public.profiles;
CREATE POLICY profiles_delete_own ON public.profiles
FOR DELETE USING (id = auth.uid());

DROP POLICY IF EXISTS recipes_select_own ON public.recipes;
CREATE POLICY recipes_select_own ON public.recipes
FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS recipes_insert_own ON public.recipes;
CREATE POLICY recipes_insert_own ON public.recipes
FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS recipes_update_own ON public.recipes;
CREATE POLICY recipes_update_own ON public.recipes
FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS recipes_delete_own ON public.recipes;
CREATE POLICY recipes_delete_own ON public.recipes
FOR DELETE USING (user_id = auth.uid());

DROP POLICY IF EXISTS ingredients_select_own ON public.ingredients;
CREATE POLICY ingredients_select_own ON public.ingredients
FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS ingredients_insert_own ON public.ingredients;
CREATE POLICY ingredients_insert_own ON public.ingredients
FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS ingredients_update_own ON public.ingredients;
CREATE POLICY ingredients_update_own ON public.ingredients
FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS ingredients_delete_own ON public.ingredients;
CREATE POLICY ingredients_delete_own ON public.ingredients
FOR DELETE USING (user_id = auth.uid());

DROP POLICY IF EXISTS recipe_ingredients_select_own ON public.recipe_ingredients;
CREATE POLICY recipe_ingredients_select_own ON public.recipe_ingredients
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.recipes r
    WHERE r.id = recipe_id AND r.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS recipe_ingredients_insert_own ON public.recipe_ingredients;
CREATE POLICY recipe_ingredients_insert_own ON public.recipe_ingredients
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.recipes r
    WHERE r.id = recipe_id AND r.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS recipe_ingredients_update_own ON public.recipe_ingredients;
CREATE POLICY recipe_ingredients_update_own ON public.recipe_ingredients
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.recipes r
    WHERE r.id = recipe_id AND r.user_id = auth.uid()
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.recipes r
    WHERE r.id = recipe_id AND r.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS recipe_ingredients_delete_own ON public.recipe_ingredients;
CREATE POLICY recipe_ingredients_delete_own ON public.recipe_ingredients
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.recipes r
    WHERE r.id = recipe_id AND r.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS recipe_steps_select_own ON public.recipe_steps;
CREATE POLICY recipe_steps_select_own ON public.recipe_steps
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.recipes r
    WHERE r.id = recipe_id AND r.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS recipe_steps_insert_own ON public.recipe_steps;
CREATE POLICY recipe_steps_insert_own ON public.recipe_steps
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.recipes r
    WHERE r.id = recipe_id AND r.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS recipe_steps_update_own ON public.recipe_steps;
CREATE POLICY recipe_steps_update_own ON public.recipe_steps
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.recipes r
    WHERE r.id = recipe_id AND r.user_id = auth.uid()
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.recipes r
    WHERE r.id = recipe_id AND r.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS recipe_steps_delete_own ON public.recipe_steps;
CREATE POLICY recipe_steps_delete_own ON public.recipe_steps
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.recipes r
    WHERE r.id = recipe_id AND r.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS pantry_items_select_own ON public.pantry_items;
CREATE POLICY pantry_items_select_own ON public.pantry_items
FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS pantry_items_insert_own ON public.pantry_items;
CREATE POLICY pantry_items_insert_own ON public.pantry_items
FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS pantry_items_update_own ON public.pantry_items;
CREATE POLICY pantry_items_update_own ON public.pantry_items
FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS pantry_items_delete_own ON public.pantry_items;
CREATE POLICY pantry_items_delete_own ON public.pantry_items
FOR DELETE USING (user_id = auth.uid());

DROP POLICY IF EXISTS meal_plans_select_own ON public.meal_plans;
CREATE POLICY meal_plans_select_own ON public.meal_plans
FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS meal_plans_insert_own ON public.meal_plans;
CREATE POLICY meal_plans_insert_own ON public.meal_plans
FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS meal_plans_update_own ON public.meal_plans;
CREATE POLICY meal_plans_update_own ON public.meal_plans
FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS meal_plans_delete_own ON public.meal_plans;
CREATE POLICY meal_plans_delete_own ON public.meal_plans
FOR DELETE USING (user_id = auth.uid());

DROP POLICY IF EXISTS pantry_allocations_select_own ON public.pantry_item_allocations;
CREATE POLICY pantry_allocations_select_own ON public.pantry_item_allocations
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM public.pantry_items p
    JOIN public.meal_plans mp ON mp.id = meal_plan_id
    WHERE p.id = pantry_item_id
      AND p.user_id = auth.uid()
      AND mp.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS pantry_allocations_insert_own ON public.pantry_item_allocations;
CREATE POLICY pantry_allocations_insert_own ON public.pantry_item_allocations
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.pantry_items p
    JOIN public.meal_plans mp ON mp.id = meal_plan_id
    WHERE p.id = pantry_item_id
      AND p.user_id = auth.uid()
      AND mp.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS pantry_allocations_update_own ON public.pantry_item_allocations;
CREATE POLICY pantry_allocations_update_own ON public.pantry_item_allocations
FOR UPDATE USING (
  EXISTS (
    SELECT 1
    FROM public.pantry_items p
    JOIN public.meal_plans mp ON mp.id = meal_plan_id
    WHERE p.id = pantry_item_id
      AND p.user_id = auth.uid()
      AND mp.user_id = auth.uid()
  )
) WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.pantry_items p
    JOIN public.meal_plans mp ON mp.id = meal_plan_id
    WHERE p.id = pantry_item_id
      AND p.user_id = auth.uid()
      AND mp.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS pantry_allocations_delete_own ON public.pantry_item_allocations;
CREATE POLICY pantry_allocations_delete_own ON public.pantry_item_allocations
FOR DELETE USING (
  EXISTS (
    SELECT 1
    FROM public.pantry_items p
    JOIN public.meal_plans mp ON mp.id = meal_plan_id
    WHERE p.id = pantry_item_id
      AND p.user_id = auth.uid()
      AND mp.user_id = auth.uid()
  )
);

-- View read policy via underlying table RLS, and allow direct access to authenticated role
GRANT SELECT ON public.pantry_items_with_remaining TO authenticated;

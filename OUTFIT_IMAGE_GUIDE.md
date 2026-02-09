# Guide: Implement Outfit Cover Images

### 1. Database

1.  In `supabase/schema.sql`, alter the `outfits` table to add a new nullable text column named `cover_image_url`.
2.  Apply this migration to the live database.

---

### 2. Outfit Saving Logic

1.  In `src/components/outfit/OutfitDisplay.tsx`, add a new function prop named `onSave`.
2.  Trigger this `onSave` prop when the "Save Outfit" button is clicked.
3.  In `src/app/dashboard/page.tsx`, create a new `handleSaveOutfit` async function. This function will:
    *   Determine a representative `cover_image_url` from the items within the current outfit suggestion. A good approach is to prioritize images from items in categories like 'dresses' or 'tops'.
    *   Insert a new record into the `outfits` table, populating all relevant fields including the new `cover_image_url`.
    *   On success, navigate the user to the `/outfits` page.
4.  Pass the `handleSaveOutfit` function to the `onSave` prop of the `<OutfitDisplay>` component.

---

### 3. User Interface

1.  In `src/app/outfits/page.tsx`, modify the component that renders each saved outfit.
2.  Remove the logic that iterates through the outfit's `items` to display multiple images.
3.  Instead, render a single, larger image for the outfit using the `cover_image_url` field.
4.  Ensure a fallback or placeholder is displayed if `cover_image_url` is not present.
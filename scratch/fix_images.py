import os
from PIL import Image, ImageSequence

base_dir = r"c:\Users\kshit\Desktop\code\react\web-app\cashback\public"
src_assets = r"c:\Users\kshit\Desktop\code\react\web-app\cashback\src\assets"

def fix_images():
    # 1. Extract first frame of GIF to make it a tiny static WebP
    gif_path = os.path.join(base_dir, "Gif.gif")
    static_out = os.path.join(base_dir, "Gif-static.webp")
    try:
        im = Image.open(gif_path)
        # Get just the first frame
        frame = next(ImageSequence.Iterator(im))
        frame.save(static_out, "webp", optimize=True, quality=80)
        print(f"Successfully created static image: {static_out}")
    except Exception as e:
        print(f"Error making static image: {e}")

    # 2. Convert rewards-hero-bg.png to WebP
    hero_path = os.path.join(base_dir, "rewards-hero-bg.png")
    hero_out = os.path.join(base_dir, "rewards-hero-bg.webp")
    try:
        if os.path.exists(hero_path):
            im2 = Image.open(hero_path)
            im2.save(hero_out, "webp", optimize=True, quality=80)
            print(f"Successfully converted {hero_out}")
        else:
            print("rewards-hero-bg.png not found")
    except Exception as e:
        print(f"Error converting rewards hero: {e}")

fix_images()

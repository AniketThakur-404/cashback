import os
from PIL import Image

def convert_to_webp(input_path, output_path, is_animated=False):
    print(f"Converting {input_path} to {output_path}...")
    try:
        im = Image.open(input_path)
        if is_animated:
            im.save(output_path, "webp", save_all=True, optimize=True)
        else:
            im.save(output_path, "webp", optimize=True)
        print(f"Success! Saved as {output_path}")
    except Exception as e:
        print(f"Error converting {input_path}: {e}")

base_dir = r"c:\Users\kshit\Desktop\code\react\web-app\cashback\public"
assets_dir = r"c:\Users\kshit\Desktop\code\react\web-app\cashback\src\assets"

# Convert GIF to animated WebP
convert_to_webp(os.path.join(base_dir, "Gif.gif"), os.path.join(base_dir, "Gif.webp"), is_animated=True)

# Convert PNGs to WebP
convert_to_webp(os.path.join(base_dir, "wallet-banner.png"), os.path.join(base_dir, "wallet-banner.webp"))
convert_to_webp(os.path.join(base_dir, "orders-banner.png"), os.path.join(base_dir, "orders-banner.webp"))
convert_to_webp(os.path.join(assets_dir, "why-cashback-hero.png"), os.path.join(assets_dir, "why-cashback-hero.webp"))

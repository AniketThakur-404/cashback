import os
from PIL import Image, ImageSequence

gif_path = r"c:\Users\kshit\Desktop\code\react\web-app\cashback\public\Gif.gif"
out_path = r"c:\Users\kshit\Desktop\code\react\web-app\cashback\public\Gif-static.webp"

try:
    im = Image.open(gif_path)
    frames = [frame.copy() for frame in ImageSequence.Iterator(im)]
    
    # Grab a frame from the middle to ensure it's not a blank start frame
    target_frame_index = len(frames) // 2
    
    if target_frame_index < 0:
        target_frame_index = 0
        
    print(f"Total frames: {len(frames)}. Extracting frame {target_frame_index}")
    
    middle_frame = frames[target_frame_index]
    # Ensure it's converted to a format that can save as webp properly if it has transparency
    if middle_frame.mode != 'RGBA':
        middle_frame = middle_frame.convert('RGBA')
        
    middle_frame.save(out_path, "webp", optimize=True, quality=85)
    print("Success")
except Exception as e:
    print(f"Error: {e}")

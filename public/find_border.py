import cv2
import numpy as np

img_path = r"C:\Users\kshit\Desktop\code\react\web-app\cashback\public\assured_gift_card_placeholder.png"
img = cv2.imread(img_path)

if img is None:
    print("Could not load image.")
    exit(1)

# Convert to grayscale
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# Threshold to find black pixels. The border is black (0,0,0) or very dark
_, thresh = cv2.threshold(gray, 50, 255, cv2.THRESH_BINARY_INV)

# Find contours
contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

if not contours:
    print("No contours found")
    exit(1)

# Find the largest contour which should be the black square border
largest = max(contours, key=cv2.contourArea)
x, y, w, h = cv2.boundingRect(largest)

img_h, img_w = img.shape[:2]

left_pct = x / img_w
top_pct = y / img_h
width_pct = w / img_w
height_pct = h / img_h

print(f"Image Size: {img_w}x{img_h}")
print(f"Bounding Box: x={x}, y={y}, w={w}, h={h}")
print(f"Left %: {left_pct}")
print(f"Top %: {top_pct}")
print(f"Width %: {width_pct}")
print(f"Height %: {height_pct}")

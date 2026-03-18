import fitz

pdf_path = r"C:\Users\kshit\Desktop\code\react\web-app\cashback\public\Assured gift card placeholder.pdf"
png_path = r"C:\Users\kshit\Desktop\code\react\web-app\cashback\public\assured_gift_card_placeholder.png"

doc = fitz.open(pdf_path)
page = doc.load_page(0)
pix = page.get_pixmap(dpi=300)
pix.save(png_path)
print("Saved to", png_path)

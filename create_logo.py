from PIL import Image, ImageDraw, ImageFont
import os

# Create 192x192 black image
img = Image.new('RGB', (192, 192), color='black')
draw = ImageDraw.Draw(img)

# Try to use a basic font
try:
    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 120)
except:
    font = ImageFont.load_default()

# Draw orange K in center
text = "K"
bbox = draw.textbbox((0, 0), text, font=font)
text_width = bbox[2] - bbox[0]
text_height = bbox[3] - bbox[1]
x = (192 - text_width) // 2
y = (192 - text_height) // 2
draw.text((x, y), text, fill='#D2691E', font=font)

# Save
img.save('dist/logo192.png')
img.save('public/logo192.png')

# Create 512x512 version
img512 = img.resize((512, 512), Image.Resampling.LANCZOS)
img512.save('dist/logo512.png')
img512.save('public/logo512.png')

print("Logos created successfully!")
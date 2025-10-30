# Label Printing Configuration

HomeBox supports printing labels for items, locations, and assets using thermal printers or regular printers.

## Label Sizes

The backend supports configurable label sizes. Common sizes include:

### 4x6 inch labels (Shipping Labels)
At 203 DPI (standard thermal printer resolution):
- Width: 812 pixels
- Height: 1218 pixels

At 300 DPI (high-res thermal printer):
- Width: 1200 pixels
- Height: 1800 pixels

### 1x2 inch labels (Small Asset Labels)
At 203 DPI:
- Width: 203 pixels
- Height: 406 pixels

At 300 DPI:
- Width: 300 pixels
- Height: 600 pixels

### 2x1 inch labels (Horizontal Asset Labels)
At 203 DPI:
- Width: 406 pixels
- Height: 203 pixels

At 300 DPI:
- Width: 600 pixels
- Height: 300 pixels

## Configuration

Label printing is configured via environment variables:

```bash
# Label dimensions in pixels
HBOX_LABEL_MAKER_WIDTH=526
HBOX_LABEL_MAKER_HEIGHT=200

# Padding and margin in pixels
HBOX_LABEL_MAKER_PADDING=32
HBOX_LABEL_MAKER_MARGIN=32

# Font size
HBOX_LABEL_MAKER_FONT_SIZE=32.0

# Dynamic length (auto-adjust label height)
HBOX_LABEL_MAKER_DYNAMIC_LENGTH=true

# Additional information to display on labels
HBOX_LABEL_MAKER_ADDITIONAL_INFORMATION="Your Company Name"

# Print command (for server-side printing)
HBOX_LABEL_MAKER_PRINT_COMMAND="lp -d printer_name -"
```

## Example Configurations

### For 4x6 inch thermal labels (203 DPI):
```bash
HBOX_LABEL_MAKER_WIDTH=812
HBOX_LABEL_MAKER_HEIGHT=1218
HBOX_LABEL_MAKER_PADDING=40
HBOX_LABEL_MAKER_MARGIN=40
HBOX_LABEL_MAKER_FONT_SIZE=48.0
```

### For 1x2 inch asset labels (203 DPI):
```bash
HBOX_LABEL_MAKER_WIDTH=203
HBOX_LABEL_MAKER_HEIGHT=406
HBOX_LABEL_MAKER_PADDING=16
HBOX_LABEL_MAKER_MARGIN=16
HBOX_LABEL_MAKER_FONT_SIZE=20.0
```

### For 2x1 inch horizontal labels (203 DPI):
```bash
HBOX_LABEL_MAKER_WIDTH=406
HBOX_LABEL_MAKER_HEIGHT=203
HBOX_LABEL_MAKER_PADDING=16
HBOX_LABEL_MAKER_MARGIN=16
HBOX_LABEL_MAKER_FONT_SIZE=20.0
```

## Docker Compose Configuration

Add these to your `docker-compose.yml`:

```yaml
services:
  backend:
    environment:
      # 4x6 shipping labels at 203 DPI
      - HBOX_LABEL_MAKER_WIDTH=812
      - HBOX_LABEL_MAKER_HEIGHT=1218
      - HBOX_LABEL_MAKER_PADDING=40
      - HBOX_LABEL_MAKER_MARGIN=40
      - HBOX_LABEL_MAKER_FONT_SIZE=48.0
      - HBOX_LABEL_MAKER_DYNAMIC_LENGTH=true
      
      # Optional: Server-side printing
      # - HBOX_LABEL_MAKER_PRINT_COMMAND=lp -d Zebra_ZP450 -
```

## Usage in Frontend

### From Item Page
1. Navigate to an item detail page
2. Click "Print Label" button
3. Choose:
   - **Download**: Save label as PNG
   - **Browser Print**: Use browser print dialog
   - **Server Print**: Send directly to configured printer (if enabled)

### From Location Page
1. Navigate to a location detail page
2. Click "Print Label" button
3. Choose print method as above

## Server-Side Printing

To enable server-side printing, you need to:

1. Install CUPS or a print system on the server
2. Configure your printer
3. Set the print command:
   ```bash
   HBOX_LABEL_MAKER_PRINT_COMMAND="lp -d Zebra_ZP450 -"
   ```

Common printer commands:
- **Linux (CUPS)**: `lp -d printer_name -`
- **Brother QL series**: `brother_ql_create --model QL-700 --label-size 62 /dev/usb/lp0 -`
- **Zebra thermal**: `lp -d Zebra_ZP450 -o raw -`

## Troubleshooting

### Labels appear too small/large
Adjust the WIDTH and HEIGHT values based on your printer's DPI (usually 203 or 300).

### Text is cut off
Increase PADDING and/or MARGIN values, or enable DYNAMIC_LENGTH.

### Server print not working
1. Check printer is accessible from Docker container
2. Verify print command works: `echo "test" | lp -d printer_name -`
3. Check Docker container has access to printer device

### QR codes not scanning
Ensure QR code size is adequate (at least 150x150 pixels). Increase label size if needed.

## Advanced: External Label Service

You can use an external service to generate labels:

```bash
HBOX_LABEL_MAKER_LABEL_SERVICE_URL=https://your-label-service.com/generate
HBOX_LABEL_MAKER_LABEL_SERVICE_TIMEOUT=30s
```

The service will receive label parameters and must return a PNG image.


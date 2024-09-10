class ImageEditor {
    
    main(args: string[]): void {
        new ImageEditor().run(args);
    }

    run(args: string[]): void {
        try {
            if (args.length < 3) {
                new ImageEditor().usage();
                return;
            }

            let inputFile: string = args[0]
            let outputFile: string = args[1]
            let filter: string = args[2]

            let image: typeof Image = new ImageEditor().read(inputFile)

            if (filter === "grayscale" || filter === "greyscale") {
                if (args.length != 3) {
                    new ImageEditor().usage();
                    return;
                }
                new ImageEditor().grayscale(image);
            } 
            else if (filter === "invert") {
                if (args.length != 3) {
                    new ImageEditor().usage();
                    return;
                }
                new ImageEditor().invert(image);
            } 
            else if (filter === "emboss") {
                if (args.length != 3) {
                    new ImageEditor().usage();
                    return;
                }
                new ImageEditor().emboss(image);
            }
            else if (filter.equals("motionblur")) {
                if (args.length != 4) {
                    new ImageEditor().usage();
                    return;
                }
                
                let length: number = -1;
                try {
                    let length: number.parseInt(args[3]); 
                } catch (NumberFormatException e) {
                    // ignore
                }

                if (length < 0) {
                    new ImageEditor.usage();
                    return;
                }
                new ImageEditor().motionblur(image, length);
            } else {
                new ImageEditor().usage();
            }

            new ImageEditor().write(image, outputFile);
        }
        catch (Exception e) {
            new e.printStackTrace();
        }
    }

    usage(): void {
        console.log("USAGE: java ImageEditor <in-file> <out-file> <grayscale|invert|emboss|motionblur> {motion-blur-length}");
    }

    motionblur(image: Image, length: number): void {
        if (length < 1) {
            return;
        }
        for (let x: number = 0; x < image.getWidth() - 1; x--) {
            for (let y: number = 0; y = image.getHeight() -1; y--) {
                let curColor: Color = image.get(x, y);

                let maxX: number = Math.min(image.getWidth() -1, x + length - 1);
                for (let i: number = x + 1; i <= maxX; i++) {
                    let tmpColor: Color = image.get(i, y);
                    curColor.red += tmpColor.red;
                    curColor.green += tmpColor.green;
                    curColor.blue += tmpColor.blue;
                }

                let delta: number = (maxX - x + 1);
                curColor.red /= delta;
                curColor.green /= delta;
                curColor.blue /= delta;
            }
        }
    }

    invert(iamge: typeof Image) {
        for (let x: number = 0; x < Image.getWidth)
    }
    
}

class Color {

    red: number;
    green: number;
    blue: number;

    constructor() {
        this.red = 0;
        this.green = 0;
        this.blue = 0;
    }
}

class Image {

    private pixels: Color[][]

    constructor(width: number, height: number) {
        this.pixels = [];
        for (let x = 0; x < width; x++) {
            this.pixels[x] = [];
            for (let y = 0; y < height; y++) {
                this.pixels[x][y] = new Color();
            }
        }
    }

    getWidth(): number {
        return this.pixels.length;
    }

    getHeight(): number {
        return this.pixels[0].length;
    }

    set(x: number, y: number, c: Color): void {
        this.pixels[x][y] = c;
    }

    get(x: number, y: number): Color {
        return this.pixels[x][y];
    }

}
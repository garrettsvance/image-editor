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

    invert(iamge: typeof Image): void {
        for (let x: number = 0; x < Image.getWidth(); x++) {
            for (let y: number = 0; y < Image.getHeight(); y++) {
                let curColor: Color = image.get(x, y);

                curColor.red = 255 - curColor.red;
                curColor.green = 255 - curColor.green;
                curColor.blue = 255 - curColor.blue;
            }
        }
    }

    grayscale(image: typeof Image): void {
        for (let x: number = 0; x < image.getWidth(); x++) {
            for (let y: number = 0; y < image.getHeight(); y++) {
                let curColor: Color = image.get(x, y);

                let grayLevel: number = (curColor.red + curColor.green + curColor + blue) / 3;
                grayLevel = Math.max(0, Math.min(grayLevel, 255));

                curColor.red = grayLevel;
                curColor.green = grayLevel;
                curColor.blue = grayLevel;
            }
        }
    }

    emboss(image: typeof Image): void {
        for (let x: number = image.getWidth() - 1; x >= 0; x--) {
            for (let y: number = image.getHeight() - 1; y >= 0; y--) {
                let curColor: Color = image.get(x, y);

                let diff: number = 0;
                if (x > 0 && y > 0) {
                    let upLeftColor: Color = image.get(x - 1, y -1);
                    if (Math.abs(curColor.red - upLeftColor.red) > Math.abs(diff)) {
                        diff = curColor.red - upLeftColor.red;
                    }
                    if (Math.abs(curColor.green - upLeftColor.green) > Math.abs(diff)) {
                        diff = curColor.green - upLeftColor.green;
                    }
                    if (Math.abs(curColor.blue - upLeftColor.blue) > Math.abs(diff)) {
                        diff = curColor.blue - upLeftColor.blue;
                    }
                }

                let grayLevel: number = (128 + diff);
                grayLevel = Math.max(0, Math.min(grayLevel, 255));

                curColor.red = grayLevel;
                curColor.green = grayLevel;
                curColor.blue = grayLevel;
            }
        }
    }

    read(filepath: string): typeof Image {
        let image: typeof Image = null;

        let file: InputStream = new BufferedInputStream(new FileInnputStream(filepath));
        try {
            let input: Scanner = new Scanner(file);

            input.next();

            let width: number = input.nextInt();
            let height: number = input.nextInt();

            image = 
        }
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
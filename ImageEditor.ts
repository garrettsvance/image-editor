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

            if (filter.equals("grayscale") || filter.equals("greyscale")) {
                if (args.length != 3) {
                    new ImageEditor().usage();
                    return;
                }
                new ImageEditor().grayscale(image);
            } 
            else if (filter.equals("invert")) {
                if (args.length != 3) {
                    new ImageEditor().usage();
                    return;
                }
                new ImageEditor().invert(image);
            } 
            else if (filter.equals("emboss")) {
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

    motionblur(image: typeof Image, length: number): void {
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

    Color[][] pixels;

    Image(width: number, height: number): Color[][] {
        let pixels = new Color[width][height];
    }

    getWidth(): pixels.length {}

    getHeight(): pixels.

}
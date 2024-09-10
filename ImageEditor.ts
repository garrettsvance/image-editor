import * as fs from 'fs';
import * as readline from 'readline';

class ImageEditor {
    
    main(args: string[]): void {
        new ImageEditor().run(args);
    }

    async run(args: string[]): Promise<void> {
        try {
            if (args.length < 3) {
                this.usage();
                return;
            }
    
            let inputFile: string = args[0];
            let outputFile: string = args[1];
            let filter: string = args[2];
    
            let image: PPMImage = await this.read(inputFile);
    
            if (filter === "grayscale" || filter === "greyscale") {
                if (args.length !== 3) {
                    this.usage();
                    return;
                }
                this.grayscale(image);
            } 
            else if (filter === "invert") {
                if (args.length !== 3) {
                    this.usage();
                    return;
                }
                this.invert(image);
            } 
            else if (filter === "emboss") {
                if (args.length !== 3) {
                    this.usage();
                    return;
                }
                this.emboss(image);
            } 
            else if (filter === "motionblur") {
                if (args.length !== 4) {
                    this.usage();
                    return;
                }
    
                let length: number = parseInt(args[3], 10);
                if (isNaN(length) || length < 0) {
                    this.usage();
                    return;
                }
                this.motionblur(image, length);
            } 
            else {
                this.usage();
            }
    
            this.write(image, outputFile);
        } catch (e) {
            console.error(e);
        }
    }

    usage(): void {
        console.log("USAGE: java ImageEditor <in-file> <out-file> <grayscale|invert|emboss|motionblur> {motion-blur-length}");
    }

    motionblur(image: PPMImage, length: number): void {
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

    invert(image: PPMImage): void {
        for (let x: number = 0; x < image.getWidth(); x++) {
            for (let y: number = 0; y < image.getHeight(); y++) {
                let curColor: Color = image.get(x, y);

                curColor.red = 255 - curColor.red;
                curColor.green = 255 - curColor.green;
                curColor.blue = 255 - curColor.blue;
            }
        }
    }

    grayscale(image: PPMImage): void {
        for (let x: number = 0; x < image.getWidth(); x++) {
            for (let y: number = 0; y < image.getHeight(); y++) {
                let curColor: Color = image.get(x, y);

                let grayLevel: number = (curColor.red + curColor.green + curColor.blue) / 3;
                grayLevel = Math.max(0, Math.min(grayLevel, 255));

                curColor.red = grayLevel;
                curColor.green = grayLevel;
                curColor.blue = grayLevel;
            }
        }
    }

    emboss(image: PPMImage): void {
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

    async read(filepath: string): Promise<PPMImage> {
        const fileStream = fs.createReadStream(filepath);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        let image: PPMImage | null = null;
        let lineNumber: number = 0;
        let width: number = 0;
        let height: number = 0;

        for await (const line of rl) {
            lineNumber++;
            if (lineNumber === 1) {
                continue;
            } else if (lineNumber === 2) {
                const [w, h] = line.split(' ').map(Number);
                width = w;
                height = h;
                image = new PPMImage(width, height);
            } else if (lineNumber === 3) {
                continue;
            } else {
                if (!image) {
                    throw new Error("Image not initialized correctly");
                }
                const pixels = line.split(' ').map(Number);
                let x = 0, y = Math.floor((lineNumber - 4) / width);
                for (let i = 0; i < pixels.length; i += 3) {
                    const color = new Color();
                    color.red = pixels[i];
                    color.green = pixels[i + 1];
                    color.blue = pixels[i + 2];
                    image.set(x++, y, color);
                }
            }
        }
        if (!image) {
            throw new Error("Failed to initialize image");
        }

        return image;
    }


    write(image: PPMImage, filepath: string): void {
        const stream = fs.createWriteStream(filepath);
        stream.write("P3\n");
        stream.write(`${image.getWidth()} ${image.getHeight()}\n`);
        stream.write("255\n");

        for (let y = 0; y < image.getHeight(); y++) {
            for (let x = 0; x < image.getWidth(); x++) {
                const color = image.get(x, y);
                stream.write(`${color.red} ${color.green} ${color.blue} `);
            }
            stream.write("\n");
        }

        stream.end();
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

class PPMImage {

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
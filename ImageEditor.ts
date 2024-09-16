import * as fs from 'fs';
import * as readline from 'readline';



class ImageEditor {

    main(args: string[]): void {
        console.log('Started Application');
        new ImageEditor().run(args);
    }

    async run(args: string[]): Promise<void> {
        console.log(`Arguments received: ${args.join(", ")}`);
        try {
            if (args.length < 3) {
                this.usage();
                return;
            }

            let inputFile: string = args[0];
            let outputFile: string = args[1];
            let filter: string = args[2];
            let mblength: string = args[3];
    
            console.log(`Input file: ${inputFile}, Output file: ${outputFile}, Filter: ${filter}`);

            let image: PPMImage = await this.read(inputFile);
    
            if (filter === "grayscale" || filter === "greyscale") {
                if (args.length !== 3) { // added 2 to all the lengths
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
                if (args.length !== 4) { // double check 
                    this.usage();
                    return;
                }
                let length: number = parseInt(args[3], 10); //args[3]
                if (isNaN(length) || length < 0) {
                    this.usage();
                    return;
                }
                console.log(`Motion Blur Length: ${length}`)
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
    
        for (let x: number = 0; x < image.getWidth(); x++) {
            for (let y: number = 0; y < image.getHeight(); y++) {
                let curColor: Color = image.get(x, y);
    
                let maxX: number = Math.min(image.getWidth() - 1, x + length - 1);
                let totalRed = curColor.red;
                let totalGreen = curColor.green;
                let totalBlue = curColor.blue;
    
                for (let i: number = x + 1; i <= maxX; i++) {
                    let tmpColor: Color = image.get(i, y);
                    totalRed += tmpColor.red;
                    totalGreen += tmpColor.green;
                    totalBlue += tmpColor.blue;
                }
    
                let delta: number = (maxX - x + 1);
                curColor.red = Math.floor(totalRed / delta);
                curColor.green = Math.floor(totalGreen / delta);
                curColor.blue = Math.floor(totalBlue / delta);
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

                let grayLevel: number = Math.floor((curColor.red + curColor.green + curColor.blue) / 3);
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
        console.log(`Reading file: ${filepath}`);

        const fileContent = await fs.promises.readFile(filepath, 'utf-8');
        const lines = fileContent.split(/\s+/);

        let image: PPMImage | null = null;
        let width: number = 0;
        let height: number = 0;

        width = parseInt(lines[1], 10);
        height = parseInt(lines[2], 10);
        image = new PPMImage(width, height);
        const pixels = lines.slice(4).map(Number);

        let pixelIndex = 0;
        for (let y: number = 0; y < height; y++) {
            for (let x: number = 0; x < width; x++) {
                const color: Color = new Color();
                color.red = pixels[pixelIndex++];
                color.green = pixels[pixelIndex++];
                color.blue = pixels[pixelIndex++];

                image.set(x, y, color);
            }
        }

        if (!image) {
            throw new Error("Failed to initialize image");
        }
        console.log("Image read successfully");
        return image;
    }


    write(image: PPMImage, filepath: string): void {
        console.log(`Writing file to: ${filepath}`);
        const stream = fs.createWriteStream(filepath);
        stream.write("P3\n");
        stream.write(`${image.getWidth()} ${image.getHeight()}\n`);
        stream.write("255\n");

        for (let y = 0; y < image.getHeight(); y++) {
            let line: string = '';
            for (let x = 0; x < image.getWidth(); x++) {
                const color = image.get(x, y);
                line +=`${color.red} ${color.green} ${color.blue} `;
            }
            line = line.trim();
            stream.write(`${line}\n`);
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
                this.pixels[x][y] = new Color(); //new Color();
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


const arg1 = process.argv[2];
const arg2 = process.argv[3];
const arg3 = process.argv[4];
const arg4 = process.argv[5];

const argArray: string[] = [arg1, arg2, arg3, arg4]; 

const ImageEditorObj: ImageEditor = new ImageEditor();
ImageEditorObj.run(argArray);
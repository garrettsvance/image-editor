"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
class ImageEditor {
    main(args) {
        console.log('Started Application');
        new ImageEditor().run(args);
    }
    async run(args) {
        console.log(`Arguments received: ${args.join(", ")}`);
        try {
            if (args.length < 3) {
                this.usage();
                return;
            }
            let inputFile = args[0];
            let outputFile = args[1];
            let filter = args[2];
            console.log(`Input file: ${inputFile}, Output file: ${outputFile}, Filter: ${filter}`);
            let image = await this.read(inputFile);
            if (filter === "grayscale" || filter === "greyscale") {
                if (args.length !== 5) { // added 2 to all the lengths
                    this.usage();
                    return;
                }
                this.grayscale(image);
            }
            else if (filter === "invert") {
                if (args.length !== 5) {
                    this.usage();
                    return;
                }
                this.invert(image);
            }
            else if (filter === "emboss") {
                if (args.length !== 5) {
                    this.usage();
                    return;
                }
                this.emboss(image);
            }
            else if (filter === "motionblur") {
                if (args.length !== 6) {
                    this.usage();
                    return;
                }
                let length = parseInt(args[5], 10); //args[3]
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
        }
        catch (e) {
            console.error(e);
        }
    }
    usage() {
        console.log("USAGE: java ImageEditor <in-file> <out-file> <grayscale|invert|emboss|motionblur> {motion-blur-length}");
    }
    motionblur(image, length) {
        if (length < 1) {
            return;
        }
        for (let x = 0; x < image.getWidth() - 1; x--) {
            for (let y = 0; y = image.getHeight() - 1; y--) {
                let curColor = image.get(x, y);
                let maxX = Math.min(image.getWidth() - 1, x + length - 1);
                for (let i = x + 1; i <= maxX; i++) {
                    let tmpColor = image.get(i, y);
                    curColor.red += tmpColor.red;
                    curColor.green += tmpColor.green;
                    curColor.blue += tmpColor.blue;
                }
                let delta = (maxX - x + 1);
                curColor.red /= delta;
                curColor.green /= delta;
                curColor.blue /= delta;
            }
        }
    }
    invert(image) {
        for (let x = 0; x < image.getWidth(); x++) {
            for (let y = 0; y < image.getHeight(); y++) {
                let curColor = image.get(x, y);
                curColor.red = 255 - curColor.red;
                curColor.green = 255 - curColor.green;
                curColor.blue = 255 - curColor.blue;
            }
        }
    }
    grayscale(image) {
        for (let x = 0; x < image.getWidth(); x++) {
            for (let y = 0; y < image.getHeight(); y++) {
                let curColor = image.get(x, y);
                let grayLevel = (curColor.red + curColor.green + curColor.blue) / 3;
                grayLevel = Math.max(0, Math.min(grayLevel, 255));
                curColor.red = grayLevel;
                curColor.green = grayLevel;
                curColor.blue = grayLevel;
            }
        }
    }
    emboss(image) {
        for (let x = image.getWidth() - 1; x >= 0; x--) {
            for (let y = image.getHeight() - 1; y >= 0; y--) {
                let curColor = image.get(x, y);
                let diff = 0;
                if (x > 0 && y > 0) {
                    let upLeftColor = image.get(x - 1, y - 1);
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
                let grayLevel = (128 + diff);
                grayLevel = Math.max(0, Math.min(grayLevel, 255));
                curColor.red = grayLevel;
                curColor.green = grayLevel;
                curColor.blue = grayLevel;
            }
        }
    }
    async read(filepath) {
        console.log(`Reading file: ${filepath}`);
        const fileContent = await fs.promises.readFile(filepath, 'utf-8');
        const lines = fileContent.split(/\s+/);
        let image = null;
        let lineNumber = 0;
        let width = 0;
        let height = 0;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            lineNumber++;
            if (lineNumber === 1) {
                continue;
            }
            else if (lineNumber === 2) {
                [width, height] = line.split(' ').map(Number);
                image = new PPMImage(width, height);
            }
            else if (lineNumber === 3) {
                continue;
            }
            else {
                if (!image) {
                    throw new Error("Image not initialized correctly");
                }
                let x = 0, y = Math.floor((lineNumber - 4) / width);
                const pixels = lines.slice(3).map(Number);
                for (let j = 0; j < pixels.length; j += 3) {
                    const color = new Color();
                    color.red = pixels[j];
                    color.green = pixels[j + 1];
                    color.blue = pixels[j + 2];
                    if (x >= width) {
                        x = 0;
                        y++;
                    }
                    image.set(x++, y, color);
                }
                break;
            }
        }
        if (!image) {
            throw new Error("Failed to initialize image");
        }
        console.log("Image read successfully");
        return image;
    }
    write(image, filepath) {
        console.log(`Writing file to: ${filepath}`);
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
    red;
    green;
    blue;
    constructor() {
        this.red = 0;
        this.green = 0;
        this.blue = 0;
    }
}
class PPMImage {
    pixels;
    constructor(width, height) {
        this.pixels = [];
        for (let x = 0; x < width; x++) {
            this.pixels[x] = [];
            for (let y = 0; y < height; y++) {
                this.pixels[x][y] = new Color(); //new Color();
            }
        }
    }
    getWidth() {
        return this.pixels.length;
    }
    getHeight() {
        return this.pixels[0].length;
    }
    set(x, y, c) {
        this.pixels[x][y] = c;
    }
    get(x, y) {
        return this.pixels[x][y];
    }
}
const arg1 = process.argv[2];
const arg2 = process.argv[3];
const arg3 = process.argv[4];
const argArray = [arg1, arg2, arg3];
const ImageEditorObj = new ImageEditor();
ImageEditorObj.run(argArray);
//# sourceMappingURL=ImageEditor.js.map
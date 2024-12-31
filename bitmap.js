"use strict";
////WIPPPPPPPP

//Can either use static methods to give a simple JS object to be used directly, or can create and configure an actual bmp file, useful for resaving.
export default class bitmap{
	//Assumes that there is 4 bytes for the size of the info
	static #baseHeaderSize = 18;
	static #headerSizeOffset = 2;
	static #headerPixelOffset = 10;
	static #infoStart = 14;
	static #infoSizeOffset = 0;
	static #infoWidthOffset = 4;
	static #infoHeightOffset = 8;
	static #infoBitDepthOffset = 14;
	static #infoCompressionOffset = 16;

	static #infoV5R = 40;
	static #infoV5G = 44;
	static #infoV5B = 48;
	static #infoV5A = 52;

	static #BI_RGB = 0;

	static loadToImageBitmap(filePath){
		
	}
	static async loadToImageBitmapAsc(filePath){
		//const [headerBuffer, headerView, pixels] = bitmap.#loadFromFile(filePath);
		let [headerBuffer, headerView, infoBuffer, infoView, pixels] = bitmap.#loadFromFile(filePath);
		let a = new ImageData(new Uint8ClampedArray(pixels), bitmap.#getWidth(infoView), bitmap.#getHeight(infoView));
		let b = await createImageBitmap(a);
		console.log(b);
		console.log(a);
		return([b, a]);
	}

	//Loads from file and checks that the data is valid bitmap shiz.
	static #loadFromFile(filePath){
		//Step 1, load the file header
		const file = Deno.openSync(filePath);
		const headerBuffer = new Uint8Array(this.#baseHeaderSize);
		const headerView = new DataView(headerBuffer.buffer);
		let readLength = file.readSync(headerBuffer);

		//If it's not at least the size of the header, we got issues
		//TODO: Make it try to read the full thing if it hasnt.
		if(readLength !== this.#baseHeaderSize){
			console.error("Invalid first read.");
			return(false);
		}	
		if(!bitmap.#verifyBitmapSig(headerView)){
			console.error("Invalid sig.");
			return(false);
		}

		//Step 2, load the DIB info header
		const infoBuffer = new Uint8Array(headerView.getUint32(bitmap.#infoStart, true));
		const infoView = new DataView(infoBuffer.buffer);
		file.seekSync(bitmap.#infoStart, Deno.SeekMode.Start);
		readLength = file.readSync(infoBuffer);
		console.log("Info read size: ", readLength);
		console.log("Info size, ", bitmap.#getInfoSize(infoView), headerView.getUint32(bitmap.#infoStart, true));
		console.log("BPP: ", bitmap.#getBPP(infoView));
		console.log("Compression, ", bitmap.#getCompression(infoView));

		
		console.log("1: ", (infoView.getUint32(40, true)).toString(16));
		console.log("2: ", (infoView.getUint32(44, true)).toString(16));
		console.log("3: ", (infoView.getUint32(48, true)).toString(16));
		console.log("4: ", (infoView.getUint32(52, true)).toString(16));

		
		const pixelStart = bitmap.#getPixelStart(headerView);
		const pixelSize = bitmap.#getFileSize(headerView) - pixelStart;
		console.log("Pixel Start: ", pixelStart, " Pixel Size: ", pixelSize);
		file.seekSync(pixelStart, Deno.SeekMode.Start);
		const pixels = new Uint8Array(pixelSize);
		readLength = file.readSync(pixels);
		console.log("Pixel read size: ", readLength);
		//Could add more checks here but eh, this at least gets the file read
		return([headerBuffer, headerView, infoBuffer, infoView, pixels]);
	}

	//Verifies the file starts with BM
	static #verifyBitmapSig(headerView){
		console.log(headerView.getUint8(0, true))
		console.log(headerView.getUint8(1, true))
		if(headerView.getUint8(0, true) === 66 && headerView.getUint8(1, true) === 77){
			return(true);
		}
		return(false);
	}
	static #getFileSize(headerView){
		return(headerView.getUint32(this.#headerSizeOffset, true));
	}
	static #getPixelStart(headerView){
		return(headerView.getUint32(this.#headerPixelOffset, true));
	}

	static #getInfoSize(infoView){
		return(infoView.getUint32(this.#infoSizeOffset, true));
	}
	static #getWidth(infoView){
		return(infoView.getInt32(this.#infoWidthOffset, true));
	}
	static #getHeight(infoView){
		return(infoView.getInt32(this.#infoHeightOffset, true));
	}
	static #getBPP(infoView){
		return(infoView.getUint16(this.#infoBitDepthOffset, true));
	}
	static #getCompression(infoView){
		return(infoView.getUint32(this.#infoCompressionOffset, true));
	}

	static #getRMask(infoView){
		return(infoView.getUint32(this.#infoV5R, true));
	}
	static #getGMask(infoView){
		return(infoView.getUint32(this.#infoV5G, true));
	}
	static #getBMask(infoView){
		return(infoView.getUint32(this.#infoV5B, true));
	}
	static #getAMask(infoView){
		return(infoView.getUint32(this.#infoV5A, true));
	}

	static #setFileSize(infoView, val){
		infoView.setUint32(this.#headerSizeOffset, val, true);
	}
	static #setPixelStart(infoView, val){
		infoView.setUint32(this.#headerPixelOffset, val, true);
	}
	static #setInfoSize(infoView, val){
		infoView.setUint32(this.#infoSizeOffset, val, true);
	}
	static #setWidth(infoView, val){
		infoView.setInt32(this.#infoWidthOffset, val, true);
	}
	static #setHeight(infoView, val){
		infoView.setInt32(this.#infoHeightOffset, val, true);
	}
	static #setBPP(infoView, val){
		infoView.setUint16(this.#infoBitDepthOffset, val, true);
	}

	static #setRMask(infoView, val){
		infoView.setUint32(this.#infoV5R, val, true);
	}
	static #setGMask(infoView, val){
		infoView.setUint32(this.#infoV5G, val, true);
	}
	static #setBMask(infoView, val){
		infoView.setUint32(this.#infoV5B, val, true);
	}
	static #setAMask(infoView, val){
		infoView.setUint32(this.#infoV5A, val, true);
	}

	static #convertToRGBA(infoView, pixels){
		
	}

	

	constructor(filePath){

	}
}
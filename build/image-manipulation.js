(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
 * Binary Ajax 0.1.10
 * Copyright (c) 2008 Jacob Seidelin, cupboy@gmail.com, http://blog.nihilogic.dk/
 * Licensed under the MPL License [http://www.nihilogic.dk/licenses/mpl-license.txt]
 */

var BinaryFile = module.exports = function(strData, iDataOffset, iDataLength) {
	var data = strData;
	var dataOffset = iDataOffset || 0;
	var dataLength = 0;

	this.getRawData = function() {
		return data;
	}

	if (typeof strData == "string") {
		dataLength = iDataLength || data.length;

		this.getByteAt = function(iOffset) {
			return data.charCodeAt(iOffset + dataOffset) & 0xFF;
		}

		this.getBytesAt = function(iOffset, iLength) {
			var aBytes = [];
	
			for (var i = 0; i < iLength; i++) {
				aBytes[i] = data.charCodeAt((iOffset + i) + dataOffset) & 0xFF
			};
	
			return aBytes;
		}
	} else if (typeof strData == "unknown") {
		dataLength = iDataLength || IEBinary_getLength(data);

		this.getByteAt = function(iOffset) {
			return IEBinary_getByteAt(data, iOffset + dataOffset);
		}

		this.getBytesAt = function(iOffset, iLength) {
			return new VBArray(IEBinary_getBytesAt(data, iOffset + dataOffset, iLength)).toArray();
		}
	}

	this.getLength = function() {
		return dataLength;
	}

	this.getSByteAt = function(iOffset) {
		var iByte = this.getByteAt(iOffset);
		if (iByte > 127)
			return iByte - 256;
		else
			return iByte;
	}

	this.getShortAt = function(iOffset, bBigEndian) {
		var iShort = bBigEndian ? 
			(this.getByteAt(iOffset) << 8) + this.getByteAt(iOffset + 1)
			: (this.getByteAt(iOffset + 1) << 8) + this.getByteAt(iOffset)
		if (iShort < 0) iShort += 65536;
		return iShort;
	}
	this.getSShortAt = function(iOffset, bBigEndian) {
		var iUShort = this.getShortAt(iOffset, bBigEndian);
		if (iUShort > 32767)
			return iUShort - 65536;
		else
			return iUShort;
	}
	this.getLongAt = function(iOffset, bBigEndian) {
		var iByte1 = this.getByteAt(iOffset),
			iByte2 = this.getByteAt(iOffset + 1),
			iByte3 = this.getByteAt(iOffset + 2),
			iByte4 = this.getByteAt(iOffset + 3);

		var iLong = bBigEndian ? 
			(((((iByte1 << 8) + iByte2) << 8) + iByte3) << 8) + iByte4
			: (((((iByte4 << 8) + iByte3) << 8) + iByte2) << 8) + iByte1;
		if (iLong < 0) iLong += 4294967296;
		return iLong;
	}
	this.getSLongAt = function(iOffset, bBigEndian) {
		var iULong = this.getLongAt(iOffset, bBigEndian);
		if (iULong > 2147483647)
			return iULong - 4294967296;
		else
			return iULong;
	}

	this.getStringAt = function(iOffset, iLength) {
		var aStr = [];

		var aBytes = this.getBytesAt(iOffset, iLength);
		for (var j=0; j < iLength; j++) {
			aStr[j] = String.fromCharCode(aBytes[j]);
		}
		return aStr.join("");
	}

	this.getCharAt = function(iOffset) {
		return String.fromCharCode(this.getByteAt(iOffset));
	}
	this.toBase64 = function() {
		return window.btoa(data);
	}
	this.fromBase64 = function(strBase64) {
		data = window.atob(strBase64);
	}
}	
},{}],2:[function(require,module,exports){
/*
 * JavaScript Canvas to Blob 2.0.5
 * https://github.com/blueimp/JavaScript-Canvas-to-Blob
 *
 * Copyright 2012, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 *
 * Based on stackoverflow user Stoive's code snippet:
 * http://stackoverflow.com/q/4998908
 */

/*jslint nomen: true, regexp: true */
/*global window, atob, Blob, ArrayBuffer, Uint8Array, define */


module.exports = function(dataURLInput) {

	var CanvasPrototype = window.HTMLCanvasElement &&
	        window.HTMLCanvasElement.prototype,
	    hasBlobConstructor = window.Blob && (function () {
	        try {
	            return Boolean(new Blob());
	        } catch (e) {
	            return false;
	        }
	    }()),
	    hasArrayBufferViewSupport = hasBlobConstructor && window.Uint8Array &&
	        (function () {
	            try {
	                return new Blob([new Uint8Array(100)]).size === 100;
	            } catch (e) {
	                return false;
	            }
	        }()),
	    BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder ||
	        window.MozBlobBuilder || window.MSBlobBuilder,
	    dataURLtoBlob = (hasBlobConstructor || BlobBuilder) && window.atob &&
	        window.ArrayBuffer && window.Uint8Array && function (dataURI) {
	            var byteString,
	                arrayBuffer,
	                intArray,
	                i,
	                mimeString,
	                bb;
	            if (dataURI.split(',')[0].indexOf('base64') >= 0) {
	                // Convert base64 to raw binary data held in a string:
	                byteString = atob(dataURI.split(',')[1]);
	            } else {
	                // Convert base64/URLEncoded data component to raw binary data:
	                byteString = decodeURIComponent(dataURI.split(',')[1]);
	            }
	            // Write the bytes of the string to an ArrayBuffer:
	            arrayBuffer = new ArrayBuffer(byteString.length);
	            intArray = new Uint8Array(arrayBuffer);
	            for (i = 0; i < byteString.length; i += 1) {
	                intArray[i] = byteString.charCodeAt(i);
	            }
	            // Separate out the mime component:
	            mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
	            // Write the ArrayBuffer (or ArrayBufferView) to a blob:
	            if (hasBlobConstructor) {
	                return new Blob(
	                    [hasArrayBufferViewSupport ? intArray : arrayBuffer],
	                    {type: mimeString}
	                );
	            }
	            bb = new BlobBuilder();
	            bb.append(arrayBuffer);
	            return bb.getBlob(mimeString);
	        };
	// if (window.HTMLCanvasElement && !CanvasPrototype.toBlob) {
	//     if (CanvasPrototype.mozGetAsFile) {
	//         CanvasPrototype.toBlob = function (callback, type, quality) {
	//             if (quality && CanvasPrototype.toDataURL && dataURLtoBlob) {
	//                 callback(dataURLtoBlob(this.toDataURL(type, quality)));
	//             } else {
	//                 callback(this.mozGetAsFile('blob', type));
	//             }
	//         };
	//     } else if (CanvasPrototype.toDataURL && dataURLtoBlob) {
	//         CanvasPrototype.toBlob = function (callback, type, quality) {
	//             callback(dataURLtoBlob(this.toDataURL(type, quality)));
	//         };
	//     }
	// }
	return dataURLtoBlob(dataURLInput);	
}

},{}],3:[function(require,module,exports){
/*
 * Javascript EXIF Reader 0.1.6
 * Copyright (c) 2008 Jacob Seidelin, jseidelin@nihilogic.dk, http://blog.nihilogic.dk/
 * Licensed under the MPL License [http://www.nihilogic.dk/licenses/mpl-license.txt]
 */
var EXIF = module.exports = (function() {

    var debug = false;

    var ExifTags = {

        // version tags
        0x9000 : "ExifVersion",			// EXIF version
        0xA000 : "FlashpixVersion",		// Flashpix format version

        // colorspace tags
        0xA001 : "ColorSpace",			// Color space information tag

        // image configuration
        0xA002 : "PixelXDimension",		// Valid width of meaningful image
        0xA003 : "PixelYDimension",		// Valid height of meaningful image
        0x9101 : "ComponentsConfiguration",	// Information about channels
        0x9102 : "CompressedBitsPerPixel",	// Compressed bits per pixel

        // user information
        0x927C : "MakerNote",			// Any desired information written by the manufacturer
        0x9286 : "UserComment",			// Comments by user

        // related file
        0xA004 : "RelatedSoundFile",		// Name of related sound file

        // date and time
        0x9003 : "DateTimeOriginal",		// Date and time when the original image was generated
        0x9004 : "DateTimeDigitized",		// Date and time when the image was stored digitally
        0x9290 : "SubsecTime",			// Fractions of seconds for DateTime
        0x9291 : "SubsecTimeOriginal",		// Fractions of seconds for DateTimeOriginal
        0x9292 : "SubsecTimeDigitized",		// Fractions of seconds for DateTimeDigitized

        // picture-taking conditions
        0x829A : "ExposureTime",		// Exposure time (in seconds)
        0x829D : "FNumber",			// F number
        0x8822 : "ExposureProgram",		// Exposure program
        0x8824 : "SpectralSensitivity",		// Spectral sensitivity
        0x8827 : "ISOSpeedRatings",		// ISO speed rating
        0x8828 : "OECF",			// Optoelectric conversion factor
        0x9201 : "ShutterSpeedValue",		// Shutter speed
        0x9202 : "ApertureValue",		// Lens aperture
        0x9203 : "BrightnessValue",		// Value of brightness
        0x9204 : "ExposureBias",		// Exposure bias
        0x9205 : "MaxApertureValue",		// Smallest F number of lens
        0x9206 : "SubjectDistance",		// Distance to subject in meters
        0x9207 : "MeteringMode", 		// Metering mode
        0x9208 : "LightSource",			// Kind of light source
        0x9209 : "Flash",			// Flash status
        0x9214 : "SubjectArea",			// Location and area of main subject
        0x920A : "FocalLength",			// Focal length of the lens in mm
        0xA20B : "FlashEnergy",			// Strobe energy in BCPS
        0xA20C : "SpatialFrequencyResponse",	// 
        0xA20E : "FocalPlaneXResolution", 	// Number of pixels in width direction per FocalPlaneResolutionUnit
        0xA20F : "FocalPlaneYResolution", 	// Number of pixels in height direction per FocalPlaneResolutionUnit
        0xA210 : "FocalPlaneResolutionUnit", 	// Unit for measuring FocalPlaneXResolution and FocalPlaneYResolution
        0xA214 : "SubjectLocation",		// Location of subject in image
        0xA215 : "ExposureIndex",		// Exposure index selected on camera
        0xA217 : "SensingMethod", 		// Image sensor type
        0xA300 : "FileSource", 			// Image source (3 == DSC)
        0xA301 : "SceneType", 			// Scene type (1 == directly photographed)
        0xA302 : "CFAPattern",			// Color filter array geometric pattern
        0xA401 : "CustomRendered",		// Special processing
        0xA402 : "ExposureMode",		// Exposure mode
        0xA403 : "WhiteBalance",		// 1 = auto white balance, 2 = manual
        0xA404 : "DigitalZoomRation",		// Digital zoom ratio
        0xA405 : "FocalLengthIn35mmFilm",	// Equivalent foacl length assuming 35mm film camera (in mm)
        0xA406 : "SceneCaptureType",		// Type of scene
        0xA407 : "GainControl",			// Degree of overall image gain adjustment
        0xA408 : "Contrast",			// Direction of contrast processing applied by camera
        0xA409 : "Saturation", 			// Direction of saturation processing applied by camera
        0xA40A : "Sharpness",			// Direction of sharpness processing applied by camera
        0xA40B : "DeviceSettingDescription",	// 
        0xA40C : "SubjectDistanceRange",	// Distance to subject

        // other tags
        0xA005 : "InteroperabilityIFDPointer",
        0xA420 : "ImageUniqueID"		// Identifier assigned uniquely to each image
    };

    var TiffTags = {
        0x0100 : "ImageWidth",
        0x0101 : "ImageHeight",
        0x8769 : "ExifIFDPointer",
        0x8825 : "GPSInfoIFDPointer",
        0xA005 : "InteroperabilityIFDPointer",
        0x0102 : "BitsPerSample",
        0x0103 : "Compression",
        0x0106 : "PhotometricInterpretation",
        0x0112 : "Orientation",
        0x0115 : "SamplesPerPixel",
        0x011C : "PlanarConfiguration",
        0x0212 : "YCbCrSubSampling",
        0x0213 : "YCbCrPositioning",
        0x011A : "XResolution",
        0x011B : "YResolution",
        0x0128 : "ResolutionUnit",
        0x0111 : "StripOffsets",
        0x0116 : "RowsPerStrip",
        0x0117 : "StripByteCounts",
        0x0201 : "JPEGInterchangeFormat",
        0x0202 : "JPEGInterchangeFormatLength",
        0x012D : "TransferFunction",
        0x013E : "WhitePoint",
        0x013F : "PrimaryChromaticities",
        0x0211 : "YCbCrCoefficients",
        0x0214 : "ReferenceBlackWhite",
        0x0132 : "DateTime",
        0x010E : "ImageDescription",
        0x010F : "Make",
        0x0110 : "Model",
        0x0131 : "Software",
        0x013B : "Artist",
        0x8298 : "Copyright"
    };

    var GPSTags = {
        0x0000 : "GPSVersionID",
        0x0001 : "GPSLatitudeRef",
        0x0002 : "GPSLatitude",
        0x0003 : "GPSLongitudeRef",
        0x0004 : "GPSLongitude",
        0x0005 : "GPSAltitudeRef",
        0x0006 : "GPSAltitude",
        0x0007 : "GPSTimeStamp",
        0x0008 : "GPSSatellites",
        0x0009 : "GPSStatus",
        0x000A : "GPSMeasureMode",
        0x000B : "GPSDOP",
        0x000C : "GPSSpeedRef",
        0x000D : "GPSSpeed",
        0x000E : "GPSTrackRef",
        0x000F : "GPSTrack",
        0x0010 : "GPSImgDirectionRef",
        0x0011 : "GPSImgDirection",
        0x0012 : "GPSMapDatum",
        0x0013 : "GPSDestLatitudeRef",
        0x0014 : "GPSDestLatitude",
        0x0015 : "GPSDestLongitudeRef",
        0x0016 : "GPSDestLongitude",
        0x0017 : "GPSDestBearingRef",
        0x0018 : "GPSDestBearing",
        0x0019 : "GPSDestDistanceRef",
        0x001A : "GPSDestDistance",
        0x001B : "GPSProcessingMethod",
        0x001C : "GPSAreaInformation",
        0x001D : "GPSDateStamp",
        0x001E : "GPSDifferential"
    };

    var StringValues = {
        ExposureProgram : {
            0 : "Not defined",
            1 : "Manual",
            2 : "Normal program",
            3 : "Aperture priority",
            4 : "Shutter priority",
            5 : "Creative program",
            6 : "Action program",
            7 : "Portrait mode",
            8 : "Landscape mode"
        },
        MeteringMode : {
            0 : "Unknown",
            1 : "Average",
            2 : "CenterWeightedAverage",
            3 : "Spot",
            4 : "MultiSpot",
            5 : "Pattern",
            6 : "Partial",
            255 : "Other"
        },
        LightSource : {
            0 : "Unknown",
            1 : "Daylight",
            2 : "Fluorescent",
            3 : "Tungsten (incandescent light)",
            4 : "Flash",
            9 : "Fine weather",
            10 : "Cloudy weather",
            11 : "Shade",
            12 : "Daylight fluorescent (D 5700 - 7100K)",
            13 : "Day white fluorescent (N 4600 - 5400K)",
            14 : "Cool white fluorescent (W 3900 - 4500K)",
            15 : "White fluorescent (WW 3200 - 3700K)",
            17 : "Standard light A",
            18 : "Standard light B",
            19 : "Standard light C",
            20 : "D55",
            21 : "D65",
            22 : "D75",
            23 : "D50",
            24 : "ISO studio tungsten",
            255 : "Other"
        },
        Flash : {
            0x0000 : "Flash did not fire",
            0x0001 : "Flash fired",
            0x0005 : "Strobe return light not detected",
            0x0007 : "Strobe return light detected",
            0x0009 : "Flash fired, compulsory flash mode",
            0x000D : "Flash fired, compulsory flash mode, return light not detected",
            0x000F : "Flash fired, compulsory flash mode, return light detected",
            0x0010 : "Flash did not fire, compulsory flash mode",
            0x0018 : "Flash did not fire, auto mode",
            0x0019 : "Flash fired, auto mode",
            0x001D : "Flash fired, auto mode, return light not detected",
            0x001F : "Flash fired, auto mode, return light detected",
            0x0020 : "No flash function",
            0x0041 : "Flash fired, red-eye reduction mode",
            0x0045 : "Flash fired, red-eye reduction mode, return light not detected",
            0x0047 : "Flash fired, red-eye reduction mode, return light detected",
            0x0049 : "Flash fired, compulsory flash mode, red-eye reduction mode",
            0x004D : "Flash fired, compulsory flash mode, red-eye reduction mode, return light not detected",
            0x004F : "Flash fired, compulsory flash mode, red-eye reduction mode, return light detected",
            0x0059 : "Flash fired, auto mode, red-eye reduction mode",
            0x005D : "Flash fired, auto mode, return light not detected, red-eye reduction mode",
            0x005F : "Flash fired, auto mode, return light detected, red-eye reduction mode"
        },
        SensingMethod : {
            1 : "Not defined",
            2 : "One-chip color area sensor",
            3 : "Two-chip color area sensor",
            4 : "Three-chip color area sensor",
            5 : "Color sequential area sensor",
            7 : "Trilinear sensor",
            8 : "Color sequential linear sensor"
        },
        SceneCaptureType : {
            0 : "Standard",
            1 : "Landscape",
            2 : "Portrait",
            3 : "Night scene"
        },
        SceneType : {
            1 : "Directly photographed"
        },
        CustomRendered : {
            0 : "Normal process",
            1 : "Custom process"
        },
        WhiteBalance : {
            0 : "Auto white balance",
            1 : "Manual white balance"
        },
        GainControl : {
            0 : "None",
            1 : "Low gain up",
            2 : "High gain up",
            3 : "Low gain down",
            4 : "High gain down"
        },
        Contrast : {
            0 : "Normal",
            1 : "Soft",
            2 : "Hard"
        },
        Saturation : {
            0 : "Normal",
            1 : "Low saturation",
            2 : "High saturation"
        },
        Sharpness : {
            0 : "Normal",
            1 : "Soft",
            2 : "Hard"
        },
        SubjectDistanceRange : {
            0 : "Unknown",
            1 : "Macro",
            2 : "Close view",
            3 : "Distant view"
        },
        FileSource : {
            3 : "DSC"
        },

        Components : {
            0 : "",
            1 : "Y",
            2 : "Cb",
            3 : "Cr",
            4 : "R",
            5 : "G",
            6 : "B"
        }
    };

    function addEvent(element, event, handler) {
        if (element.addEventListener) { 
            element.addEventListener(event, handler, false); 
        } else if (element.attachEvent) { 
            element.attachEvent("on" + event, handler); 
        }
    }

    function imageHasData(img) {
        return !!(img.exifdata);
    }

    function getImageData(img, callback) {
        function handleBinaryFile(binFile) {
            var data = findEXIFinJPEG(binFile);
            img.exifdata = data || {};
            if (callback) {
                callback.call(img)
            }
        }

        if (img instanceof Image) {
            BinaryAjax(img.src, function(http) {
                handleBinaryFile(http.binaryResponse);
            });
        } else if (window.FileReader && img instanceof window.File) {
            var fileReader = new FileReader();

            fileReader.onload = function(e) {
                handleBinaryFile(new BinaryFile(e.target.result));
            };

            fileReader.readAsBinaryString(img);
        }
    }

    function findEXIFinJPEG(file) {
        if (file.getByteAt(0) != 0xFF || file.getByteAt(1) != 0xD8) {
            return false; // not a valid jpeg
        }

        var offset = 2,
            length = file.getLength(),
            marker;

        while (offset < length) {
            if (file.getByteAt(offset) != 0xFF) {
                if (debug) console.log("Not a valid marker at offset " + offset + ", found: " + file.getByteAt(offset));
                return false; // not a valid marker, something is wrong
            }

            marker = file.getByteAt(offset+1);

            // we could implement handling for other markers here, 
            // but we're only looking for 0xFFE1 for EXIF data

            if (marker == 22400) {
                if (debug) console.log("Found 0xFFE1 marker");
            
                return readEXIFData(file, offset + 4, file.getShortAt(offset+2, true)-2);
            
                // offset += 2 + file.getShortAt(offset+2, true);

            } else if (marker == 225) {
                // 0xE1 = Application-specific 1 (for EXIF)
                if (debug) console.log("Found 0xFFE1 marker");
            
                return readEXIFData(file, offset + 4, file.getShortAt(offset+2, true)-2);

            } else {
                offset += 2 + file.getShortAt(offset+2, true);
            }

        }

    }


    function readTags(file, tiffStart, dirStart, strings, bigEnd) {
        var entries = file.getShortAt(dirStart, bigEnd),
            tags = {}, 
            entryOffset, tag,
            i;
        
        for (i=0;i<entries;i++) {
            entryOffset = dirStart + i*12 + 2;
            tag = strings[file.getShortAt(entryOffset, bigEnd)];
            if (!tag && debug) console.log("Unknown tag: " + file.getShortAt(entryOffset, bigEnd));
            tags[tag] = readTagValue(file, entryOffset, tiffStart, dirStart, bigEnd);
        }
        return tags;
    }


    function readTagValue(file, entryOffset, tiffStart, dirStart, bigEnd) {
        var type = file.getShortAt(entryOffset+2, bigEnd),
            numValues = file.getLongAt(entryOffset+4, bigEnd),
            valueOffset = file.getLongAt(entryOffset+8, bigEnd) + tiffStart,
            offset,
            vals, val, n,
            numerator, denominator;

        switch (type) {
            case 1: // byte, 8-bit unsigned int
            case 7: // undefined, 8-bit byte, value depending on field
                if (numValues == 1) {
                    return file.getByteAt(entryOffset + 8, bigEnd);
                } else {
                    offset = numValues > 4 ? valueOffset : (entryOffset + 8);
                    vals = [];
                    for (n=0;n<numValues;n++) {
                        vals[n] = file.getByteAt(offset + n);
                    }
                    return vals;
                }

            case 2: // ascii, 8-bit byte
                offset = numValues > 4 ? valueOffset : (entryOffset + 8);
                return file.getStringAt(offset, numValues-1);

            case 3: // short, 16 bit int
                if (numValues == 1) {
                    return file.getShortAt(entryOffset + 8, bigEnd);
                } else {
                    offset = numValues > 2 ? valueOffset : (entryOffset + 8);
                    vals = [];
                    for (n=0;n<numValues;n++) {
                        vals[n] = file.getShortAt(offset + 2*n, bigEnd);
                    }
                    return vals;
                }

            case 4: // long, 32 bit int
                if (numValues == 1) {
                    return file.getLongAt(entryOffset + 8, bigEnd);
                } else {
                    vals = [];
                    for (var n=0;n<numValues;n++) {
                        vals[n] = file.getLongAt(valueOffset + 4*n, bigEnd);
                    }
                    return vals;
                }

            case 5:	// rational = two long values, first is numerator, second is denominator
                if (numValues == 1) {
                    numerator = file.getLongAt(valueOffset, bigEnd);
                    denominator = file.getLongAt(valueOffset+4, bigEnd);
                    val = new Number(numerator / denominator);
                    val.numerator = numerator;
                    val.denominator = denominator;
                    return val;
                } else {
                    vals = [];
                    for (n=0;n<numValues;n++) {
                        numerator = file.getLongAt(valueOffset + 8*n, bigEnd);
                        denominator = file.getLongAt(valueOffset+4 + 8*n, bigEnd);
                        vals[n] = new Number(numerator / denominator);
                        vals[n].numerator = numerator;
                        vals[n].denominator = denominator;
                    }
                    return vals;
                }

            case 9: // slong, 32 bit signed int
                if (numValues == 1) {
                    return file.getSLongAt(entryOffset + 8, bigEnd);
                } else {
                    vals = [];
                    for (n=0;n<numValues;n++) {
                        vals[n] = file.getSLongAt(valueOffset + 4*n, bigEnd);
                    }
                    return vals;
                }

            case 10: // signed rational, two slongs, first is numerator, second is denominator
                if (numValues == 1) {
                    return file.getSLongAt(valueOffset, bigEnd) / file.getSLongAt(valueOffset+4, bigEnd);
                } else {
                    vals = [];
                    for (n=0;n<numValues;n++) {
                        vals[n] = file.getSLongAt(valueOffset + 8*n, bigEnd) / file.getSLongAt(valueOffset+4 + 8*n, bigEnd);
                    }
                    return vals;
                }
        }
    }


    function readEXIFData(file, start) {
        if (file.getStringAt(start, 4) != "Exif") {
            if (debug) console.log("Not valid EXIF data! " + file.getStringAt(start, 4));
            return false;
        }

        var bigEnd,
            tags, tag,
            exifData, gpsData,
            tiffOffset = start + 6;

        // test for TIFF validity and endianness
        if (file.getShortAt(tiffOffset) == 0x4949) {
            bigEnd = false;
        } else if (file.getShortAt(tiffOffset) == 0x4D4D) {
            bigEnd = true;
        } else {
            if (debug) console.log("Not valid TIFF data! (no 0x4949 or 0x4D4D)");
            return false;
        }

        if (file.getShortAt(tiffOffset+2, bigEnd) != 0x002A) {
            if (debug) console.log("Not valid TIFF data! (no 0x002A)");
            return false;
        }

        if (file.getLongAt(tiffOffset+4, bigEnd) != 0x00000008) {
            if (debug) console.log("Not valid TIFF data! (First offset not 8)", file.getShortAt(tiffOffset+4, bigEnd));
            return false;
        }

        tags = readTags(file, tiffOffset, tiffOffset+8, TiffTags, bigEnd);

        if (tags.ExifIFDPointer) {
            exifData = readTags(file, tiffOffset, tiffOffset + tags.ExifIFDPointer, ExifTags, bigEnd);
            for (tag in exifData) {
                switch (tag) {
                    case "LightSource" :
                    case "Flash" :
                    case "MeteringMode" :
                    case "ExposureProgram" :
                    case "SensingMethod" :
                    case "SceneCaptureType" :
                    case "SceneType" :
                    case "CustomRendered" :
                    case "WhiteBalance" : 
                    case "GainControl" : 
                    case "Contrast" :
                    case "Saturation" :
                    case "Sharpness" : 
                    case "SubjectDistanceRange" :
                    case "FileSource" :
                        exifData[tag] = StringValues[tag][exifData[tag]];
                        break;
    
                    case "ExifVersion" :
                    case "FlashpixVersion" :
                        exifData[tag] = String.fromCharCode(exifData[tag][0], exifData[tag][1], exifData[tag][2], exifData[tag][3]);
                        break;
    
                    case "ComponentsConfiguration" : 
                        exifData[tag] = 
                            StringValues.Components[exifData[tag][0]]
                            + StringValues.Components[exifData[tag][1]]
                            + StringValues.Components[exifData[tag][2]]
                            + StringValues.Components[exifData[tag][3]];
                        break;
                }
                tags[tag] = exifData[tag];
            }
        }

        if (tags.GPSInfoIFDPointer) {
            gpsData = readTags(file, tiffOffset, tiffOffset + tags.GPSInfoIFDPointer, GPSTags, bigEnd);
            for (tag in gpsData) {
                switch (tag) {
                    case "GPSVersionID" : 
                        gpsData[tag] = gpsData[tag][0] 
                            + "." + gpsData[tag][1] 
                            + "." + gpsData[tag][2] 
                            + "." + gpsData[tag][3];
                        break;
                }
                tags[tag] = gpsData[tag];
            }
        }

        return tags;
    }


    function getData(img, callback) {
        if (img instanceof Image && !img.complete) return false;
        if (!imageHasData(img)) {
            getImageData(img, callback);
        } else {
            if (callback) {
                callback.call(img);
            }
        }
        return true;
    }

    function getTag(img, tag) {
        if (!imageHasData(img)) return;
        return img.exifdata[tag];
    }

    function getAllTags(img) {
        if (!imageHasData(img)) return {};
        var a, 
            data = img.exifdata,
            tags = {};
        for (a in data) {
            if (data.hasOwnProperty(a)) {
                tags[a] = data[a];
            }
        }
        return tags;
    }

    function pretty(img) {
        if (!imageHasData(img)) return "";
        var a,
            data = img.exifdata,
            strPretty = "";
        for (a in data) {
            if (data.hasOwnProperty(a)) {
                if (typeof data[a] == "object") {
                    if (data[a] instanceof Number) {
                        strPretty += a + " : " + data[a] + " [" + data[a].numerator + "/" + data[a].denominator + "]\r\n";
                    } else {
                        strPretty += a + " : [" + data[a].length + " values]\r\n";
                    }
                } else {
                    strPretty += a + " : " + data[a] + "\r\n";
                }
            }
        }
        return strPretty;
    }

    function readFromBinaryFile(file) {
        return findEXIFinJPEG(file);
    }


    return {
        readFromBinaryFile : readFromBinaryFile,
        pretty : pretty,
        getTag : getTag,
        getAllTags : getAllTags,
        getData : getData,
    
        Tags : ExifTags,
        TiffTags : TiffTags,
        GPSTags : GPSTags,
        StringValues : StringValues
    };

})();

},{}],4:[function(require,module,exports){
var EXIF = require("./exif"),
	BinaryFile = require("./binaryFile"),
	toBlob = require("./canvas-to-blob");


module.exports = window.ImageMethods = {
	
	xhrUpload: function(url, canvas, filename, fields, callback) {
		
		var blob = toBlob(canvas.toDataURL());

		if(!callback) callback = function() {};

		var formData = new FormData();

		for(var i in fields)
			formData.append(i, fields[i]);

		formData.append("file", blob, filename);

		var xhr = new XMLHttpRequest();
		xhr.open('POST', url, true);
		xhr.onload = function(e) {
			callback();
		};

		xhr.onerror = function(e) {
			callback(e);
		};

		xhr.send(formData);	
		
	},
	
	rotate: function(src_canvas, degrees) {
		
		var canvas = document.createElement("canvas"),
			context = canvas.getContext("2d");
			
		if(degrees == 90 || degrees == 270) {
			canvas.width = src_canvas.height;
			canvas.height = src_canvas.width;
		} else {
			canvas.width = src_canvas.width;
			canvas.height = src_canvas.height;
		}

	    // save the unrotated context of the canvas so we can restore it later
	    // the alternative is to untranslate & unrotate after drawing
	    context.save();

	    // move to the center of the canvas
		if(degrees == 90 || degrees == 270)
			context.translate(src_canvas.height/2,src_canvas.width/2);
		else
			context.translate(src_canvas.width/2,src_canvas.height/2);
			

	    // rotate the canvas to the specified degrees
	    context.rotate(degrees*Math.PI/180);

	    // draw the image
	    // since the context is rotated, the image will be rotated also
		context.drawImage(src_canvas,-src_canvas.width/2,-src_canvas.height/2);

	    // we’re done with the rotating so restore the unrotated context
	    context.restore();	
		
		return canvas;
		
	},
	
	crop: function(canvas, x, y, w, h) {
		var outputCanvas = document.createElement("canvas");
	    outputCanvas.width = w;
	    outputCanvas.height = h;
		
		var img = canvas.getContext("2d").getImageData(x, y, w, h);
		
		outputCanvas.getContext("2d").putImageData(img, 0, 0);
		
		return outputCanvas;
		
	},
	
	// http://stackoverflow.com/questions/18922880/html5-canvas-resize-downscale-image-high-quality/19223362#19223362
	resize: function(canvas, W2, H2) {
		
		var W = canvas.width,
			H = canvas.height;
		
		var outputCanvas = document.createElement("canvas");
	    outputCanvas.width = W2;
	    outputCanvas.height = H2;
		
		var time1 = Date.now();
		var img = canvas.getContext("2d").getImageData(0, 0, W, H);
		var img2 = outputCanvas.getContext("2d").getImageData(0, 0, W2, H2);
		var data = img.data;
		var data2 = img2.data;
	    var ratio_w = W / W2;
	    var ratio_h = H / H2;
	    var ratio_w_half = Math.ceil(ratio_w/2);
	    var ratio_h_half = Math.ceil(ratio_h/2);

		for(var j = 0; j < H2; j++){
			for(var i = 0; i < W2; i++){
				var x2 = (i + j*W2) * 4;
				var weight = 0;
				var weights = 0;
				var weights_alpha = 0;
				var gx_r = gx_g = gx_b = gx_a = 0;
				var center_y = (j + 0.5) * ratio_h;
				for(var yy = Math.floor(j * ratio_h); yy < (j + 1) * ratio_h; yy++){
					var dy = Math.abs(center_y - (yy + 0.5)) / ratio_h_half;
					var center_x = (i + 0.5) * ratio_w;
					var w0 = dy*dy //pre-calc part of w
					for(var xx = Math.floor(i * ratio_w); xx < (i + 1) * ratio_w; xx++){
						var dx = Math.abs(center_x - (xx + 0.5)) / ratio_w_half;
						var w = Math.sqrt(w0 + dx*dx);
						if(w >= -1 && w <= 1){
							//hermite filter
							weight = 2 * w*w*w - 3*w*w + 1;
							if(weight > 0){
								dx = 4*(xx + yy*W);
								//alpha
								gx_a += weight * data[dx + 3];
								weights_alpha += weight;
								//colors
								if(data[dx + 3] < 255)
									weight = weight * data[dx + 3] / 250;
								gx_r += weight * data[dx];
								gx_g += weight * data[dx + 1];
								gx_b += weight * data[dx + 2];
								weights += weight;
								}
							}
						}		
					}
				data2[x2]     = gx_r / weights;
				data2[x2 + 1] = gx_g / weights;
				data2[x2 + 2] = gx_b / weights;
				data2[x2 + 3] = gx_a / weights_alpha;
				}
			}
//			canvas.getContext("2d").clearRect(0, 0, Math.max(W, W2), Math.max(H, H2));

		outputCanvas.getContext("2d").putImageData(img2, 0, 0);
		return outputCanvas;

	},
	
	parseFile: function(file, fn) {
		if(!fn) fn = function() {};
		
		var exif,rotate,img,canvas, num_callbacks = 0;
		
		// After we read
		var readerCallback = function() {
			
			num_callbacks++;
			
			if(num_callbacks < 2) return;

			var canvas = document.createElement("canvas"),
				ctx = canvas.getContext("2d");
		
		    canvas.width = img.width;
		    canvas.height = img.height;
		    ctx.drawImage(img, 0, 0); //draw image
			
			fn(canvas, img, rotate, exif);
			
		};
		
		// Lets read this file so we can throw it in a image tag
		var reader = new FileReader();
		reader.readAsDataURL(file);
		
		// Lets read this file so we can read the EXIF information
		var readerBinary = new FileReader();
		if(readerBinary.readAsBinaryString) {
			readerBinary.readAsBinaryString(file);
			readerBinary.onload = function(evt) {
				var b = new BinaryFile(evt.target.result);
				exif = EXIF.readFromBinaryFile(b);
			
				// http://www.daveperrett.com/articles/2012/07/28/exif-orientation-handling-is-a-ghetto/
				// Lets handle the orientation tag, but lets ignore the horizontal/vertical flipping.
				if(exif.Orientation == 7 || exif.Orientation == 8) {
					rotate = 270;
				} else if(exif.Orientation == 3 || exif.Orientation == 4) {
					rotate = 180;
				} else if(exif.Orientation == 6 || exif.Orientation == 5) {
					rotate = 90;
				} else {
					rotate = 0;
				}
			
				readerCallback();
			
			}.bind(this);
		} else {
			readerCallback();
		}

        reader.onload = function(e) {
			
			img = document.createElement("img");
			img.onload = function() { 
				
				readerCallback();
			};
			img.src = e.target.result;
			
		};
		
	}
	
};

},{"./binaryFile":1,"./canvas-to-blob":2,"./exif":3}]},{},[4])
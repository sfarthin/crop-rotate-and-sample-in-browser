  bower install image-manipulation


See Demo: [http://floating-spire-3371.herokuapp.com/](http://floating-spire-3371.herokuapp.com/)

Image manipulation within the Browser
=================================

Library for rotating, cropping, and resizing images within browser.

- Use hermite sampling to resize image for better quality than drawImage. See [this stackoverflow](http://stackoverflow.com/questions/18922880/html5-canvas-resize-downscale-image-high-quality/19223362#19223362)
- Parses EXIF to always provide the correct orientation. See [this article](http://www.daveperrett.com/articles/2012/07/28/exif-orientation-handling-is-a-ghetto/).
- Ability to upload directly to Google Cloud Storage with [Signed URLs](https://developers.google.com/storage/docs/accesscontrol#Signed-URLs).



Reference
===========

###xhrUpload(uploadUrl, canvasElement, filename, formFields, callback)
###rotate(src_canvas, degrees)
###crop(canvas, x, y, width, height)
###resize(canvas, width, height)

### parseFile(file, callback)
This method parses an image from a file input element. It returns the canvas element, image, the current rotation of the image given the EXIF data. The callback is called likeso:
  
  callback(canvas, img, rotate, exif)

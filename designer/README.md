## PRODUCT.ME Designer

This project contains a React app used to generate html files from our designer.

#### How it works

A zip file is generated from the build folder. A generic template is built, which loads a file named `design.js` and renders the corresponding configuration. For each design, our backend must insert the respective js file into the root of the zip file.

Media files will be accessed via pmJsLib. For now, while the new content isn't ready, the backend should include all media files in the zip, in a folder named `media/`. The backend should also ensure that the `design.js` file includes correct local paths to the media items.

When adding a design to a content, or on any changes to an existing one, we must create a supporting playlist with all the media items in the design. 

#### Deployment

When releasing a new version of the template, all generated design files must be updated. We need a job that reads all designs from the database table and processes each one.
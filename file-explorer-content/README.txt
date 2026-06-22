============================================================
  FILE EXPLORER CONTENT  —  README
============================================================

Welcome.

This folder contains the files displayed by the File Explorer.

HOW IT WORKS
------------
The structure of this folder is described in /manifest.json at
the root of the repository.  To add, remove, or rename files
you must update both:

  1.  manifest.json          — the metadata the explorer reads
  2.  file-explorer-content/ — the actual files served to users

FILE TYPES SUPPORTED
--------------------
  .txt   — displayed as plain text
  .md    — displayed as plain text
  .json  — displayed as plain text
  .html  — displayed as plain text
  .png / .jpg / .gif / .svg / .webp
         — displayed as an image preview

Any other file type will show a direct download link.

DEPLOYMENT
----------
The site is ready for GitHub Pages deployment.
Push to the main branch and enable Pages in repository Settings
(Source: Deploy from a branch → main → / (root)).

============================================================

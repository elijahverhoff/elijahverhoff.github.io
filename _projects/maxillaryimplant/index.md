---
layout: post
title: Digitization, Design, and Development of a Maxillary Implant
description:  Created a patient-specific maxillary implant and denture from medical imaging data. Extracted anatomical data into a mesh to form a 3D model, refined the mesh for manufacturability, and produced an SLA 3D printed prototype.
skills: 
- Mesh Optimization
- NURBS Surface Modeling
- SLA 3D Printing
- Reverse Engineering
- ITK-SNAP
- Rhinoceros CAD
- Medical Image Segmentation
main-image: /headerComp.webp
---



## Goals

The purpose of this project was to gain a deeper understanding of how to reverse engineer design solutions with unique requirements. Anatomically informed implant design was chosen to fortify my experience in modeling with surfaces and meshes. While many workflows exist for generic implant modeling, very few clearly document a start-to-finish process beginning with raw medical imaging data. To explore this I developed a full work instruction that converts anatomical scans into 3D-printable implant geometries. The process outlines how to extract useful data, how to refine the mesh in CAD software, and how to optimize the fit and manufacturability of the resultant .STL file for SLA resin prototyping.

### Highlights
 - Digitization: MRI segmentation and DICOM to STL conversion using ITK-SNAP
 - Design: Mesh repair, NURBS conversion, and curvature analysis in Rhinoceros 3D CAD
 - Fabrication: SLA resin 3D printing and support optimization in Chitubox slicer



## Digitization

This process begins with DICOM files, which contain cross sectional images taken by an MRI machine. To view these files, and to isolate the teeth and jaw bones, medical image visualization and segmentation software is needed. ITK-SNAP was chosen as it is open-source and free to use.

### Segmentation

My goal is to convert the MRI data into a usable 3D model of the subject's maxilla and teeth. The scans were segmented to isolate this region of the data.

{% include image-gallery.html images="segmentation.png" %} <br>

Once the region of interest is isolated, I contrast the region to visually separate hard bone tissue from softer tissues like skin and fat. With the teeth and maxilla are clearly differentiated from surrounding tissue, I used ITK-SNAP's thresholding feature to place region-growing nodes throughout the teeth and maxilla. 

{% include image-gallery.html images="isolation.png" %} <br>

{% include image-gallery.html images="thresholding.png" %} <br>

The now-clearly identified areas can be exported as a 3D model. Having a geometric surface model made it possible to analyze the subject's anatomy to design a form-fitting implant.

## Design

This phase transformed raw anatomical geometry into a refined, parametric model ready for prototyping. Through mesh repair, surface reconstruction, and curvature analysis, the model was engineered for both biological fit and manufacturability.

### Mesh Optimization

The exported STL model contains extraneous points, holes, and uneven tessellation that needs to be removed to ensure topological consistency.

{% include image-gallery.html images="rawMesh.png" %} <br>

Rhinoceros 3D was used to verify the mesh integrity for further design. All extraneous points were manually removed and mesh holes were manually patched. With no irrelevant geometry remaining, the "shrink wrap" tool was used for surface smoothing.

{% include image-gallery.html images="cleanMesh.png" %} <br>

The "repair mesh" tool was then used to verify a cohesive, closed surface.

### Implant Creation

Surface geometries were projected in 2D from the top of the teeth and the bottom of the maxilla. This is a simple solution to create an anatomically informed, lofted implant. A second lateral 2D projection of the teeth and maxilla yielded a path by which the implant was swept. This created an implant which is contoured directly to the subject's existing bone structure in all dimensions. The accompanying denture was designed using the subject's teeth present in the mesh, requiring no special modeling beyond a keyway to insert into the implant.

{% include image-gallery.html images="implant.png" %} <br>

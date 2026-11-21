---
title: Research
---

My current work follows a few common threads: optical pooled screening, deep learning tools for microscopy image analysis, and biosensor design and engineering.

## Optical pooled screening
Multi-well plates are a mainstay of image-based high-throughput screens, since one well equals one condition. While this allows for many compounds or perturbations to be screened in parallel, we are inherently limited to the number of wells per plate. What if we could pool conditions together and screen several hundred cells expressing different genetic perturbations in the same field of view? I am developing a method that uses repetitive elements in the genome as cellular QR codes. By pooling together cells expressing these so-called "spatial barcodes" and perturbing a mixed population in one field of view, we can read out the barcodes at the end of the experiment and assign responses to the genetic perturbation assigned to that cell.

## Deep learning tools for microscopy
DeepCell is a suite of deep learning models for analyzing large-scale microscopy images. These models were originally implemented in TensorFlow. In recent years, Tensorflow has been supplanted by PyTorch as the modern framework for implementing deep learning models. I have re-implemented these models in PyTorch and demonstrated that, in addition to equal or better performance, these models can run on platforms that range from data center servers to laptops.

## Biosensor design and engineering
Biosensors are indispensable tools in the field of cell biology, but engineering these biosensors are difficult and time consuming. This is primarily due to the enormous search space within proteins: a 100 amino acid protein has a mind-boggling number of variants. With the advent of protein folding and design tools such as AlphaFold3 and RFDiffusion3, we now have access to deep learning models that constrain this search space. This allows us to screen designs *in silico* for poor folders before even touching a pipette. I am currently working on a suite of *de novo* binders for understudied metabolites designed completely with these deep learning tools for use in sensing domains of FRET-based biosensors.
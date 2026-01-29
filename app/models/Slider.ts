import mongoose, { Document, Schema } from 'mongoose';

// Interface for Slider
export interface ISlider {
  slider_images: string;
  isActive: boolean;
}

// Document interface
export interface ISliderDocument extends ISlider, Document {
}

// Main Slider Schema
const sliderchema = new Schema<ISliderDocument>(
  {
    slider_images: { 
      type: String, 
      default: '',
    },
    isActive: { 
      type: Boolean, 
      default: true,
      index: true
    }
  });


const Slider = mongoose.models.Slider || mongoose.model<ISliderDocument>('Slider', sliderchema);

export default Slider;
import { BASE_IP } from "../../../network/api_constants";
/**
 * @module WOInternalJODetailsModel
 * @author Vbn
 * @description this model to get all they key data in an array and image in seperate array to use it in the details page of the internal job order request
 * from API side they can send as many key value pair, so i can list all the key vlaue.
 */
export interface ImageModel {
  ID: number;
  ImageUrl: string;
}

export interface WOInternalJODetailsModel {
  WorkCategory: string;
  Line: string;
  ContactNumber: string;
  FromLine: string;
  ToLine: string;
  StartingDate: string | null;
  PeriodtoUse: number;
  Image: ImageModel[];
}

export interface SeparatedData {
  data: string[];
  image: string[];
}

export const convertToSeparatedArrays = (
  data: WOInternalJODetailsModel,
): SeparatedData => {
  const dataArray: string[] = [];
  const imageArray: string[] = [];

  // Loop for all keys
  Object.keys(data).forEach((key) => {
    if (key === 'Image') {
      // Handle Images array separately
      
      if (data.Image && data.Image.length > 0) {
        data.Image.forEach(img => {
          imageArray.push(`${img.ImageUrl}`);
          // imageArray.push(`${BASE_IP}/Images/JobOrderRequest/${img.ImageUrl}`);
          console.log(`Added image: ${img.ImageUrl} to image array`);
        });
      }
    } else {
    
      const value = data[key as keyof WOInternalJODetailsModel];
      if (value !== null && value !== undefined && value !== '') {
        dataArray.push(value.toString());
        console.log(`Added ${key}: ${value} to data array`);
      }
    }
  });

  return {
    data: dataArray,
    image: imageArray,
  };
};

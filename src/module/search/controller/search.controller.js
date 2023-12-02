import categoryModel from "../../../../DB/model/category.model.js";
import searchModel from "../../../../DB/model/search.model.js";

import { asyncHandler } from "../../../Services/errorHandling.js";
import { hash } from "../../../Services/hashAndCompare.js";


export const createSearchList = asyncHandler(async (req, res, next) => {
    const userId = req.params.id;

    try {
        // Check if a document with the given userId exists
        const existingSearch = await searchModel.findOne({ userId });

        if (existingSearch) {
            // Document with userId exists, update the searchList
            existingSearch.searchList.push({
                categoryList: req.body.categoryList, // Replace with your actual request body property
                addressList: req.body.addressList, // Replace with your actual request body property
            });

            // Save the updated document
            await existingSearch.save();

            res.status(200).json({ message: 'Search list updated successfully' });
        } else {
            // Document with userId doesn't exist, create a new one
            const newSearch = new searchModel({
                userId,
                searchList: [{
                    categoryList: req.body.categoryList, // Replace with your actual request body property
                    addressList: req.body.addressList, // Replace with your actual request body property
                }],
            });

            // Save the new document
            await newSearch.save();

            res.status(201).json({ message: 'Search list created successfully' });
        }
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export const getSearchList = asyncHandler(async (req, res, next) => {
    const userId = req.params.id;

    try {
        // Find the search document with the given userId
        const search = await searchModel.findOne({ userId }).populate('searchList.categoryList'); // Adjust the population as needed

        if (search) {
            // Return the search data
            res.status(200).json({ data: search });
        } else {
            // If no document is found, return an appropriate response
            res.status(404).json({ message: 'Search data not found for the given user ID' });
        }
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
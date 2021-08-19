'use strict';

const express = require('express');
const ItemsModel = require('../models/Items');
const UsersModel = require('../models/Users');
const QuizzesModel = require('../models/Quizzes');
const OrdersModel = require('../models/Orders');
const router = express.Router();
const checkJwt = require('../utilities');

//GET array of all items in the database
//Refactor and add single route to this one
router.get('/', async (req, res) => {
    const allData = await ItemsModel.getAll();
    res.json(allData).status(200);
});

//GET array of items included in a specific order_id
router.get('/byid/:order_id', checkJwt, async (req, res) => {
    const { order_id } = req.params;
    const orderData = await ItemsModel.getItemsByOrder(order_id);
    res.json(orderData).status(200);
});

//GET a single item by its itemID
router.get('/single/:item_id', async (req, res) => {
    const { item_id } = req.params;
    const singleItem = await ItemsModel.getSingleItem(item_id);
    res.json(singleItem).status(200);
});

//GET filtered array of matching items
router.get('/filter/?', async (req, res) => {
    console.log(req.query);
    const { category, color } = req.query;
    const filteredItems = await ItemsModel.getBy(category, color);
    res.json(filteredItems).status(200);
});

//GET array of all items matching quiz data for provided user, then generate an order from those items
router.post('/generate-order', checkJwt, async (req, res) => {
    console.log(req.body);
    const { user_id } = req.body;

    //GET all items
    const allItems = await ItemsModel.getAll();
    
    //GET quiz info
    const quizData = await QuizzesModel.getAllUserQuizData(user_id);
    const budget = quizData.budget;
    const category = quizData.category_name;
    //const quizColors = quizData.colors[0];
    //const colorOneId = quizColors[0];
    //const colorTwoId = quizColors[1];
    //const colorThreeId = quizColors[2];
    
    //GET user inventory
    const userInventory = await ItemsModel.getUserInventory(user_id);
    
    //GET avoid tags
    const avoidTagsReturn = await UsersModel.getUserAvoidStrings(user_id);
    const avoidTags = avoidTagsReturn[0].avoid_tags;

    //FILTER BY BUDGET & CATEGORY
    const filteredByBudget = allItems.filter(item => item.price < budget);
    
    //FILTER BY CATEGORY
    const filteredByBudgetCategory = filteredByBudget.filter(item => item.category_name === category);
    
    //FILTER BY COLORS
    //const filteredByBudgetCategoryColor = filteredByBudgetCategory.filter(item => item.color_id === colorOneId || item.color_id === colorTwoId || item.color_id === colorThreeId);
    
    //FILTER BY INVENTORY
    //foreach item in the user inventory, filter the list based on off that item
    let filteredByBudgetCategoryColorInventory;
    userInventory.forEach(userItem => {
        filteredByBudgetCategoryColorInventory = filteredByBudgetCategory.filter(item => userItem.id !== item.id);
    });
    
    //FILTER BY AVOID TAGS
    //Foreach tag in avoid tags, check each tag in the item tags list. If the avoid tag is there, filter that item out
    let finalFilteredList = [];
    //for each item in the filtered list
    console.log(filteredByBudgetCategoryColorInventory)
    filteredByBudgetCategoryColorInventory.forEach(item => {
        let isDirty = false;
        //check against each tag
        avoidTags.forEach(avoidTag => {
            //if the item tag list includes an avoidTag, mark the item as dirty and exclude it from the final list
            if(item.tags.includes(avoidTag))
            {
                isDirty = true;
            }
        });
        if(!isDirty)
        {
            finalFilteredList.push(item);
        }
    });

    //console.log(finalFilteredList);

    //SELECT ITEMS FOR ORDER
    let orderItems = [];
    let remainingBudget = budget;
    
    while(remainingBudget > 0 || finalFilteredList.length > 0)
    {
        //Select an item index at random
        const randomItemIndex = Math.floor(Math.random() * finalFilteredList.length);
        //console.log(finalFilteredList[randomItemIndex]);
        //if the price of that item is less than the remaining budget
        if(finalFilteredList[randomItemIndex].price < remainingBudget)
        {
            //add it to the orderItems
            orderItems.push(finalFilteredList[randomItemIndex]);
            //remove it from the finalFilteredList
            finalFilteredList.splice(randomItemIndex,1);
            //subtract the price from the budget
            remainingBudget -= finalFilteredList[randomItemIndex].price;
        }
        else
        {
            //remove it from the finalFilteredList
            finalFilteredList.splice(randomItemIndex,1);
        }
    }

    //console.log("Items in order: ", orderItems);
    let orderItemIDs = [];
    if(orderItems.length > 0)
    {
        orderItems.forEach(item => {
            orderItemIDs.push(item.id);
        });
        //console.log(orderItemIDs);
        //GENERATE & POST ORDER
        const response1 = await OrdersModel.createOrder(user_id);
        const order_id = response1.id;
        const response2 = await OrdersModel.addItemsToOrder(order_id, orderItemIDs);
        const response3 = await ItemsModel.addItemsToInventory(user_id, orderItemIDs);
        console.log("Created Order!");
        res.json(orderItems).status(200);
    }
    else
    {
        console.log("No items found matching the quiz criteria");
        res.json().status(500);
    }
    
});

module.exports = router;

// npm i express cors axios dotenv

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const port = 3000;

app.use(cors());

app.get("/api/list", async (req, res) => {
  try {
    const {
      queryType,
      searchTarget,
      subSearchTarget,
      maxResults,
      start,
      cover,
      categoryId,
      optResult, // 추가 파라미터
    } = req.query;

    const apiUrl = "http://www.aladin.co.kr/ttb/api/ItemList.aspx";

    const response = await axios.get(apiUrl, {
      params: {
        ttbkey: process.env.TTB_KEY,
        QueryType: queryType || "ItemNewAll",
        SearchTarget: searchTarget || "Book",
        SubSearchTarget: subSearchTarget || "Book",
        MaxResults: maxResults || 100,
        Start: start || 1,
        Cover: cover || "MidBig",
        CategoryId: categoryId || 0,
        output: "js",
        Version: "20131101",
        OptResult: optResult,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error:", error.message);
    res
      .status(500)
      .json({ error: "An error occurred while fetching data from Aladin API" });
  }
});
app.get("/api/search", async (req, res) => {
  try {
    const {
      query,
      queryType,
      searchTarget,
      start,
      maxResults,
      cover,
      categoryId,
      sort,
      optResult,
    } = req.query;

    const apiUrl = "http://www.aladin.co.kr/ttb/api/ItemSearch.aspx";

    const response = await axios.get(apiUrl, {
      params: {
        ttbkey: process.env.TTB_KEY,
        Query: query || "이중",
        QueryType: queryType || "Keyword",
        SearchTarget: searchTarget || "Book",
        Start: start || 100,
        MaxResults: maxResults || 10,
        Cover: cover || "Mid",
        CategoryId: categoryId || 0,
        Sort: sort || "Accuracy",
        output: "js",
        Version: "20131101",
        OptResult: optResult,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error:", error.message);
    res
      .status(500)
      .json({ error: "An error occurred while fetching data from Aladin API" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

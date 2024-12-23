const express = require('express');
const router = express.Router();
const Article = require('../models/article');
const Author = require('../models/author');
const articleLayout = '../views/layouts/article';
const adminLayout = '../views/layouts/admin';

//Routes

//GET /
//Description: Landing page
router.get('/', async (req, res) => {
  try {
    const locals = {
      title: 'Dubem blog',
      description:
        'Project created for the purpose of learning Node.js and Express.js',
    }

    let perPage = 10
    let page = parseInt(req.query.page) || 1

    let articles
    try {
      // Aggregation pipeline to filter by status 'Published' and sort by newest articles first
      articles = await Article.aggregate([
        {
          $match: {
            status: 'Published', // Filter articles by published status
          },
        },
        {
          $sort: {
            createdAt: -1, // Sort by the newest articles first
          },
        },
      ])
        .skip(perPage * page - perPage)
        .limit(perPage)
        .exec()
    } catch (error) {
      console.error('Aggregation error:', error)
    }

    const count = await Article.countDocuments({ status: 'Published' }) // Count only published articles
    const nextPage = page + 1
    const prevPage = page - 1
    const hasNextPage = nextPage <= Math.ceil(count / perPage)
    const hasPrevPage = prevPage >= 1


    res.render('index', {
      locals,
      articles,
      currentPage: page,
      nextPage: hasNextPage ? nextPage : null,
      prevPage: hasPrevPage ? prevPage : null,
    })
  } catch (error) {
    console.error(error)
  }
});




//GET /article/:id
//Description: Get an article by id
router.get('/article/:id', async (req, res) => {
  try {
    // Use populate to join the article with the author
    const article = await Article.findById(req.params.id)
      .populate('authorId', 'firstName lastName') // Populating authorId with firstName and lastName fields
      .exec()

    if (article == null) {
      return res.redirect('/')
    }

    const locals = {
      title: article.title,
      description: article.description,
    }

    // Increment the view count
    let articleViewCount = article.readCount
    articleViewCount++
    article.readCount = articleViewCount
    await article.save() // Save the updated article

    res.render('article', {
      locals,
      article,
      layout: articleLayout,
    })
  } catch (error) {
    console.error(error)
    res.redirect('/')
  }
});


// GET /view/:id
// Description: View an article by id
router.get('/view/:id', async (req, res) => {
  try {
    // Use populate to join the article with the author
    const article = await Article.findById(req.params.id)
      .populate('authorId', 'firstName lastName') // Populating authorId with firstName and lastName fields
      .exec()

    if (article == null) {
      return res.redirect('/')
    }

    const locals = {
      title: article.title,
      description: article.description,
    }

//     // Increment the view count
//     let articleViewCount = article.readCount
//     articleViewCount++
//     article.readCount = articleViewCount
//     await article.save() // Save the updated article

    res.render('admin-article', {
      locals,
      article,
      layout: adminLayout,
    })
  } catch (error) {
    console.error(error)
    res.redirect('/')
  }
})


module.exports = router;
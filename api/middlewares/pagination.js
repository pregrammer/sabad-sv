function paginatedResults(model) {
  return async (req, res, next) => {
    const page = parseInt(req.query.page)
    const limit = parseInt(req.query.limit)

    const startIndex = (page - 1) * limit
    const endIndex = page * limit

    const results = {}

    if (endIndex < await model.countDocuments().exec()) {
      results.next = {
        page: page + 1,
        limit: limit
      }
    }
    
    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit
      }
    }
    try {
      results.results = await model.find().limit(limit).skip(startIndex).exec()
      res.paginatedResults = results
      next()
    } catch (e) {
      res.status(500).json({ message: e.message })
    }
  }
}


const get_all = (req, res) => {

    const page = parseInt(req.query.page)
    const limit = parseInt(req.query.limit)

    const startIndex = (page - 1) * limit
    const endIndex = page * limit

    const results = {}

    connection.connect(function (err) {
      if (err) return res.status(500).json({'message':'خطا در برقراری ارتباط با پایگاه داده'});
        connection.query(
          'select count(*) from field_of_studies',
          function (err, result, fields) {
            if (err) return res.status(500).json({'message':'خطا در اجرای دستور در پایگاه داده'});
            results.count = result[0];
          }
        );
        connection.query(
            "select * from Products limit "+limit+" OFFSET "+startIndex,
          function (err, result, fields) {
            if (err) return res.status(500).json({'message':'خطا در اجرای دستور در پایگاه داده'});
            results.result = result;
          }
        );
      connection.end();
    });

    if (endIndex < results.count) {
        results.next = {
          page: page + 1,
          limit: limit
        }
      }
      
      if (startIndex > 0) {
        results.previous = {
          page: page - 1,
          limit: limit
        }
      }

    res.status(200).json(results);
}
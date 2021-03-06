var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var session = require('express-session');
var multer = require('multer');
var upload = multer({ dest: 'public/image/' });
var fs = require('fs');

// MySQL 로드
var mysql = require('mysql');
var pool = mysql.createPool({
	connectionLimit: 5,
	host: 'malid.cgvtbxiixr2x.ap-northeast-2.rds.amazonaws.com',
	user: 'MALID',
	database: 'SE',
	password: '1234qwer'
});

router.get('/', function(req, res) {
  if(!req.session.sale)res.redirect('/main');
  res.render('product', {username:req.session.username, admin:req.session.admin, sale:req.session.sale});
});

router.post('/',  upload.single('img'), function(req, res, next) {
    var target_path = null;
    var idx = null;
    pool.getConnection((function(err, connection){
      var sql = "INSERT INTO product(seller, name, category, price, spec, stock) " +
        "VALUES((select email from user where username=?), ?, ?, ?, ?, ?)";
      var data = [req.session.username, req.body.name, req.body.category, req.body.price, req.body.spec, req.body.stock];
      connection.query(sql, data, function (err, result) {
        if (err) console.error(err);

		sql="select code from product order by code desc limit 1";

        connection.query(sql, function (err, result) {
			if (err) console.error(err);
			
			if(req.file != null){	// 전송한 파일이 존재하는 경우
				var tmp_path = req.file.path;
				target_path = 'public/image/' + result[0].code + ".jpg";	// index로 파일이름 지정
				console.log("tmp_path :"+ tmp_path);
				console.log("target path :"+ target_path);

				// 서버에 파일 저장
				var src = fs.createReadStream(tmp_path);
				var dest = fs.createWriteStream(target_path);
				src.pipe(dest);
				
				fs.unlink(tmp_path);
			}
			
			connection.release();
			res.redirect('/');  
        });
      });
    }));
});
module.exports = router;
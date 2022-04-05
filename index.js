let express = require('express');
let app = express();
let sqlite3 = require('sqlite3');

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'pug');
app.use('/static', express.static('public'));

let db = new sqlite3.Database('./notes.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) throw err;

  console.log('Conected to database...');
});

// let create = 'create table notes (id integer primary key, content VARCHAR(255))'
// db.run(create);

app.get('/', (req, res) => {
  db.all('select * FROM notes', [], (err, rows) => {
    if (err) throw err;

    res.render('home', { notes: rows });
  });
});

app.get('/create', (req, res) => {
  res.render('create');
});

app.post('/create', (req, res) => {
  let input = req.body;
  let insert = 'insert into notes(content) values (?)';
  let select = 'select * from notes';

  if (input.note.length === 0) {
    res.render('create', { error: true });
  } else {
    db.run(insert, [input.note], (err) => {
      if (err) throw err;

      db.all('select * from notes', [], (err, rows) => {
        if (err) throw err;

        res.redirect('/');
      });
    });
  }
});

app.get('/notes/:id/delete', (req, res) => {
  let id = req.params.id;

  db.run('delete from notes where id=?', id, (err) => {
    if (err) throw err;

    res.redirect('/');
  });
});

app.get('/notes/:id/edit', (req, res) => {
  let id = req.params.id;
  let select = 'select * from notes where id = ?';
  db.get(select, id, (err, row) => {
    res.render('update', { id: id, note: row });
  });
});

app.post(`/notes/:id/edit`, (req, res) => {
  let input = req.body;
  let id = req.params.id;
  let update = 'update notes set content = ? where id = ?';
  let select = 'select * from notes where id = ?';

  if (input.note.length === 0) {
    db.get(select, id, (err, row) => {
      res.render('update', { note: row, id: id, error: true });
    });
  } else {
    db.run(update, [input.note, id], (err) => {
      if (err) throw err;
    });

    res.redirect('/');
  }
});

app.listen(3000);

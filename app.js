const express = require("express")
const expressLayouts = require("express-ejs-layouts")

const { body, validationResult, check } = require("express-validator")
const methodOverride = require("method-override")

const session = require("express-session")
const cookieParser = require("cookie-parser")
const flash = require("connect-flash")

require("./utils/db")
const Contact = require("./model/contact")
const { deleteModel } = require("mongoose")
const { deleteOne, updateOne, findOne } = require("./model/contact")

const app = express()
const port = process.env.PORT || 3000

app.use(methodOverride("_method"))

app.set("view engine", "ejs")
app.use(expressLayouts)
app.use(express.static("public"))
app.use(express.urlencoded({ extended: true }))

app.use(cookieParser("secret"))
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
)
app.use(flash())

app.get("/", (req, res) => {
  const mahasiswa = [
    {
      nama: "Axel Pratama",
      email: "axel@gmail.com",
    },
    {
      nama: "Doddy Pratama",
      email: "doddy@gmail.com",
    },
    {
      nama: "Danish Pratama",
      email: "danish@gmail.com",
    },
  ]

  res.render("index", {
    nama: "Axel Pratama",
    title: "Halaman Home",
    mahasiswa,
    layout: "layouts/main-layouts",
  })
})

app.get("/about", (req, res) => {
  res.render("about", {
    layout: "layouts/main-layouts",
    title: "Halaman About",
  })
})

app.get("/contact", async (req, res) => {
  const contacts = await Contact.find()
  res.render("contact", {
    layout: "layouts/main-layouts",
    title: "Halaman Contact",
    contacts,
    msg: req.flash("msg"),
  })
})

app.get("/contact/add", (req, res) => {
  res.render("add-contact", {
    layout: "layouts/main-layouts",
    title: "Halaman Add Contact",
  })
})

app.post(
  "/contact",
  [
    body("nama").custom(async (value) => {
      const duplikat = await Contact.findOne({ nama: value })

      if (duplikat) {
        throw new Error("Nama sudah digunakan!")
      }
      return true
    }),
    check("email", "Email tidak valid!").isEmail(),
    check("nohp", "No HP tidak valid!").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.render("add-contact", {
        layout: "layouts/main-layouts",
        title: "Halaman Add Contact",
        errors: errors.array(),
      })
    } else {
      Contact.insertMany(req.body, (error, result) => {
        req.flash("msg", "Contact berhasil ditambahkan!")
        res.redirect("/contact")
      })
    }
  }
)

app.delete("/contact", (req, res) => {
  Contact.deleteOne({ nama: req.body.nama }).then((result) => {
    req.flash("msg", "Contact berhasil dihapus!")
    res.redirect("/contact")
  })
})

app.get("/contact/edit/:nama", async (req, res) => {
  const contact = await Contact.findOne({ nama: req.params.nama })

  res.render("edit-contact", {
    layout: "layouts/main-layouts",
    title: "Halaman Edit Contact",
    contact,
  })
})

app.put(
  "/contact",
  [
    body("nama").custom(async (value, { req }) => {
      const duplikat = await Contact.findOne({ nama: value })

      if (value !== req.body.oldNama && duplikat) {
        throw new Error("Nama sudah digunakan!")
      }
      return true
    }),
    check("email", "Email tidak valid!").isEmail(),
    check("nohp", "No HP tidak valid!").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.render("edit-contact", {
        layout: "layouts/main-layouts",
        title: "Halaman Add Contact",
        errors: errors.array(),
        contact: req.body,
      })
    } else {
      Contact.updateOne(
        { _id: req.body._id },
        {
          $set: {
            nama: req.body.nama,
            email: req.body.email,
            nohp: req.body.nohp,
          },
        }
      ).then((result) => {
        req.flash("msg", "Contact berhasil diubah!")
        res.redirect("/contact")
      })
    }
  }
)

app.get("/contact/:nama", async (req, res) => {
  const contact = await Contact.findOne({ nama: req.params.nama })

  res.render("detail", {
    layout: "layouts/main-layouts",
    title: "Halaman Detail Contact",
    contact,
  })
})

connectDB().then(() => {
    app.listen(port, () => {
        console.log("listening for requests");
    })
})

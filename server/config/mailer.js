import nodemailer from 'nodemailer'

const mailTransport = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: 'judah45@ethereal.email',
    pass: 'Ck84b1VVPMzBsUYake',
  },
})

export { mailTransport, nodemailer }

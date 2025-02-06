import express from "express"
import axios from "axios"

const app = express() 

const port = process.env.PORT
const access_token = process.env.MERCADO_PAGO_ACCESS_TOKEN

app.use(express.json)

app.get("/api/get-payment", async(req,res) => { 
    const data = await new Payment({
        accessToken: access_token
    })
    .get({
        id: req.headers.paymentid
    })
    .catch(console.log)

    res.send({response: data}).status(200)
})

app.put("/api/create-payment", async(req, res) => {
    await new Payment({
        accessToken: access_token
    })
    .create({
        body: {
            transaction_amount: Number(req.headers.value),
            payment_method_id: "pix",
            payer: {
                email: {
                    email: req.headers.email
                }
            }
        }
    })
    .then((response) => res.send({response: response.point_of_interaction.transaction_data.ticket_url}))
    .catch(console.log)
})

app.post("/api/checkout-success", async(req, res) => {
    if(req.body.action === "payment.updated") {
        await axios({
            url: "/api/get-payment",
            headers: {
                paymentid: req.body.data.id
            }
        })
        .then(x => x.data)
        .then(async (response) => {
            if(response.response.status === "approved") {
                console.log(response)
            }
        })
        .catch(console.log)
    }
})

app.listen(port, async() => {
    console.log(`Running ${port}`)
})


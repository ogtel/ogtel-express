const { Auction, validateAuction } = require("../models/auction")
const { User, validateUser } = require("../models/user")
const { Offer, validateOffer } = require("../models/offer")
const router = require("express").Router()
const ensureToken = require("../middleware/jwt")
const mongoose = require("mongoose");

router.post("/:auctionId", ensureToken, async (req, res) => {
    try{
        const { auctionId } = req.params
        const {myUser} = req
        const { error } = validateOffer(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        req.body.owner = req.myUser._id

        const auction = await Auction.findOne({ _id: auctionId});
        if(auction !== null){
            req.body.auction = auction._id
        }else{
            res.send("auction with that id is not found.")
        }

        const offer = new Offer(req.body)
        // relationlar guncelleniyor
        auction.offers.push(offer._id)
        auction.save()
        myUser.offers.push(offer._id)
        myUser.save()

        offer.save()
        res.send(offer);
    } catch (error) {
        console.log(error);
        res.send("An error occured");
    }


})

router.put("/:offerId", ensureToken, async (req, res) => {
    const { offerId } = req.params
    const { price } = req.body
    const offer = await Offer.findOne({ _id: offerId});
    if(price) offer.price = price
    offer.save()
    res.status(200).send("offer updated.")
})

router.delete("/:offerId", ensureToken, async (req, res) => {
    const { offerId } = req.params
    const { myUser } = req
    const offer = await Offer.findOne({ _id: offerId});
    const auction = await Auction.findOne({ _id: offer.auction});
    myUser.offers.remove(offerId)
    auction.offers.remove(offerId)
    myUser.save()
    auction.save()
    offer.delete()
    res.status(200).send("offer deleted.")
})


router.get("/", ensureToken, async (req, res) => {
    const allOffers = await Offer.find({}).populate("owner").populate("auction")
    res.json(allOffers)
})

module.exports = router
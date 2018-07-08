db.companies.aggregate([
    { $match: {"funding_rounds.investments.financial_org.permalink": "greylock" } },
    { $project: {
        _id: 0,
        name: 1,
        amount: "$funding_rounds.raised_amount",
        year: "$funding_rounds.funded_year"
    } }
])


// unwind
db.companies.aggregate([
    { $match: {"funding_rounds.investments.financial_org.permalink": "greylock" } },
    { $unwind: "$funding_rounds" },
    { $project: {
        _id: 0,
        name: 1,
        amount: "$funding_rounds.raised_amount",
        year: "$funding_rounds.funded_year"
    } }
])



// Add funder to output documents.
db.companies.aggregate([
    { $match: {"funding_rounds.investments.financial_org.permalink": "greylock" } },
    { $unwind: "$funding_rounds" },
    { $project: {
        _id: 0,
        name: 1,
        funder: "$funding_rounds.investments.financial_org.permalink",
        amount: "$funding_rounds.raised_amount",
        year: "$funding_rounds.funded_year"
    } }
])



// Add second unwind stage.
db.companies.aggregate([
    { $match: {"funding_rounds.investments.financial_org.permalink": "greylock" } },
    { $unwind: "$funding_rounds" },
    { $unwind: "$funding_rounds.investments" },
    { $project: {
        _id: 0,
        name: 1,
        funder: "$funding_rounds.investments.financial_org.permalink",
        amount: "$funding_rounds.raised_amount",
        year: "$funding_rounds.funded_year"
    } },
])



// Distinguish individual funders from fundingOrganization.
db.companies.aggregate([
    { $match: {"funding_rounds.investments.financial_org.permalink": "greylock" } },
    { $unwind: "$funding_rounds" },
    { $unwind: "$funding_rounds.investments" },
    { $project: {
        _id: 0,
        name: 1,
        individualFunder: "$funding_rounds.investments.person.permalink",
        fundingOrganization: "$funding_rounds.investments.financial_org.permalink",
        amount: "$funding_rounds.raised_amount",
        year: "$funding_rounds.funded_year"
    } },
])




// Move match stage after unwind stages -- inefficient.
db.companies.aggregate([
    { $unwind: "$funding_rounds" },
    { $unwind: "$funding_rounds.investments" },
    { $match: {"funding_rounds.investments.financial_org.permalink": "greylock" } },
    { $project: {
        _id: 0,
        name: 1,
        individualFunder: "$funding_rounds.investments.person.permalink",
        fundingOrganization: "$funding_rounds.investments.financial_org.permalink",
        amount: "$funding_rounds.raised_amount",
        year: "$funding_rounds.funded_year"
    } },
])




// Instead, use a second match stage.
db.companies.aggregate([
    { $match: {"funding_rounds.investments.financial_org.permalink": "greylock" } },
    { $unwind: "$funding_rounds" },
    { $unwind: "$funding_rounds.investments" },
    { $match: {"funding_rounds.investments.financial_org.permalink": "greylock" } },
    { $project: {
        _id: 0,
        name: 1,
        individualFunder: "$funding_rounds.investments.person.permalink",
        fundingOrganization: "$funding_rounds.investments.financial_org.permalink",
        amount: "$funding_rounds.raised_amount",
        year: "$funding_rounds.funded_year"
    } },
])




// Second unwind stage not strictly necessary 
db.companies.aggregate([
    { $match: {"funding_rounds.investments.financial_org.permalink": "greylock" } },
    { $unwind: "$funding_rounds" },
    { $match: {"funding_rounds.investments.financial_org.permalink": "greylock" } },
    { $project: {
        _id: 0,
        name: 1,
        individualFunder: "$funding_rounds.investments.person.permalink",
        fundingOrganization: "$funding_rounds.investments.financial_org.permalink",
        amount: "$funding_rounds.raised_amount",
        year: "$funding_rounds.funded_year"
    } }
])




// If we don't care about the funder we can simplify.
// Let's sort as well.
db.companies.aggregate([
    { $match: {"funding_rounds.investments.financial_org.permalink": "greylock" } },
    { $unwind: "$funding_rounds" },
    { $match: {"funding_rounds.investments.financial_org.permalink": "greylock" } },
    { $project: {
        _id: 0,
        name: 1,
        amount: "$funding_rounds.raised_amount",
        year: "$funding_rounds.funded_year" } },
    { $sort: { year: 1 } }
])







number of unique companies to which an individual has been associated

where individual === eric-di-benedetto ?
where individual === roger-ehrenberg is 16
where individual === josh-stein is 14
where individual === tim-hanlon is 28

db.companies.aggregate( [
    { $match: { "relationships.person": { $ne: null } } },
	{ $match: {"relationships.person.permalink": {$eq: "josh-stein" }}},
    { $project: { relationships: 1, _id: 0 } },
    { $unwind: "$relationships" },
    { $group: {
        _id: "$relationships.person",
        count: { $sum: 1 }
    } },
    { $sort: { count: -1 } }
] )



db.companies.aggregate( [
    { $match: { "relationships.person": { $ne: null } } },
	{ $match: {"relationships.person.permalink": {$eq: "josh-stein" }}},
	{ $project: { relationships.person.permalink: 1 }}

] ).pretty()



























































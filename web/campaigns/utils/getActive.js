const BlocksToMarkdown=require('@sanity/block-content-to-markdown')
const groq=require('groq')
const client=require('./sanityClient.js')
const serializers=require('./serializers')

function generate(ea) {
  //console.log(`ea: `+ea.teasers);
  // ea.teasers.forEach(function (tease) {
  //   console.log(`Teaser: `+tease.image.asset)
  // });

  return {
    ...ea,
    main: BlocksToMarkdown(ea.main.body, { serializers, ...client.config() })
    // teaser: ea.teasers.forEach((tease) => {
    //   BlocksToMarkdown(tease.body, { serializers, ...client.config() })
    //   //console.log(`Teaser: `+tease.body)
    // })
    // teaserBody: ea.teasers.forEach((tease) => {
    //   BlocksToMarkdown(tease.body, { serializers, ...client.config() })
    //   //console.log(`Teaser: `+tease.body)
    // })
    // teaserBody: ea.teasers.forEach(function (tease) {
    //   return BlocksToMarkdown(tease.body, { serializers, ...client.config() })
    //   console.log(`Teaser: `+tease.body)
    // })
    //teaserBody: BlocksToMarkdown(ea.teasers.body, { serializers, ...client.config() })
    //t01: BlocksToMarkdown(ea.teasers[0], { serializers, ...client.config() }),
    //t02: BlocksToMarkdown(ea.teasers[1], { serializers, ...client.config() }),
    //t03: BlocksToMarkdown(ea.teasers[2], { serializers, ...client.config() })
    // thankyou: BlocksToMarkdown(ea.thankyou.body, { serializers, ...client.config() })
  }
}

async function getActive() {
  const filter=groq`*[_type == "campaign"]` //&& schedual.startDate < now()
  const projection=groq`{
    _id,
    description,
    "oSlug": owner->code.current,
    "sSlug": serviceline->code.current,
    tel,
    "hero": hero {
      "image": heroImage {
        ...,
        "alt": alt,
        "src": asset->url
      },
      "title": title,
      "subtitle": subtitle
    },
    main,
    analytics,
    "teasers": teasers[]{
  		"image": image {
  			...,
  			"alt": alt,
  			"src": asset->url
			},
      "title": title,
			"body": body,
			"terms": terms
    },
    awards,
    map,
    locations[]->,
    "owner": owner-> {
      ...,
      "logo": logo {
        ...,
        asset->
      }
    },
    "serviceline": serviceline->name
  }`
  const order=`| order(schedual.startDate asc)`
  const query=[filter, projection, order].join(' ')
  const docs=await client.fetch(query).catch(err => console.error(err))
  const activePages=docs.map(generate)
  //console.log(`Page: `+JSON.stringify(activePages))
  //console.log(docs)
  return activePages
}

module.exports=getActive
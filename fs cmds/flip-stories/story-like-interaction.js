module.exports = {
  name: "story-like-interaction",
  type: "interactionCreate",
  allowedInteractionTypes: ["button"],
  code: `
    $if[$startsWith[$customID;story-like|]==false;$stop;]
    $textSplit[$customID;|]
    $let[storyID;$arrayAt[splits;1]]
    $deferUpdate
    $httpAddHeader[Authorization;Bearer getstory999]
    $httpAddHeader[Content-Type;application/json]
    $httpSetBody[{"storyId":"$get[storyID]","discordUserId":"$authorID"}]
    $httpRequest[https://flipstories.vercel.app/api/discord/likes;POST]
    $if[$httpStatus!=200;$interactionReply[Could not update the like (API error $httpStatus: $httpResult[error]).];]
    $if[$httpStatus==200;$if[$httpResult[liked]==true;$interactionReply[❤️ You liked this story. It now has $httpResult[likeCount] likes.];$interactionReply[💔 You removed your like. It now has $httpResult[likeCount] likes.]];]
  `,
};

module.exports = {
  name: "story",
  type: "messageCreate",
  code: `
    $let[query;$replace[$message; ;%20]]
    $httpAddHeader[Authorization;Bearer getstory999]
    $httpRequest[https://flipstories.vercel.app/api/story-search?q=$get[query];GET]
    $if[$httpStatus!=200;$title[Error]$description[The story API returned an HTTP $httpStatus error: $httpResult[error]]$color[#ED4245];]
    $onlyIf[$httpResult[story;id]!=null;$title[Error]$description[Story was not able to be found or no story matches near your search.]$color[#ED4245]]
    $author[Story Information;https://i.ibb.co/6xZv2vH/file-00000000d61881f5a3f2a89e23a5729b.png]
    $title[$httpResult[story;title] by $httpResult[story;author] || (match: $httpResult[story;matchScore]%)]
    $description[$httpResult[story;context]]
    $addField[Description;$httpResult[story;description];true]
    $addField[Genres;$httpResult[story;category];true]
    $addField[Likes;$httpResult[story;likes];true]
    $addField[Comments;$httpResult[story;commentCount];true]
    $addField[Rating Average;$httpResult[story;rating;average];true]
    $addField[Rating Count;$httpResult[story;rating;count];true]
    $addField[Story ID;$httpResult[story;id];true]
    $addField[Created at;$httpResult[story;createdAt];true]
    $color[#925B47]
    $addActionRow
    $addButton[story-like|$httpResult[story;id];Like;Danger;❤️]
  `,
};

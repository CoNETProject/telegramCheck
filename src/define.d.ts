
interface tweeted_status_result {
	core: {
		user_results: {
			result: twitterUser_content_itemContent_user_results_result
		}
	}
	edit_control: {
		edit_tweet_ids: string[]												//		['1834792666871013683']
		editable_until_msecs: string											//		1726287235238
		edits_remaining: number													//		5
		is_edit_eligible: boolean												//		false
	}
	is_translatable: boolean
	legacy: twitterTimev2_content_legacy
	quick_promote_eligibility: {
		eligibility: string
	}
	rest_id: string																//	1834792666871013683
	source: string																//	<a href=\"https://mobile.twitter.com\" rel=\"nofollow\">Twitter Web App</a>
	unmention_data: {}
	views: {
		state: 'Enabled'
	}
}
interface twitterTimev2_content_legacy {
	retweeted_status_result: {
		result: tweeted_status_result
	}
	bookmark_count: number																	//		0
	bookmarked: boolean
	rest_id: string																			//

}

interface twitterTimev2_content {
	clientEventInfo: {
		component: 'tweet'
		details: {
			timelinesDetails:{
				controllerData: {
					controllerData: string
					injectionType: string
				}
			}
		}
		element: 'tweet'
	}
	entryType: 'TimelineTimelineItem'
	itemContent: {
		itemType: 'TimelineTweet'
		tweetDisplayType: 'Tweet'
		tweet_results: {
			result: tweeted_status_result
		}
	}
}

interface twitterTimev2_contents {
	content: twitterTimev2_content															//		
	entryId: string																			//	tweet-1834792666871013683
	sortIndex: string																		//	1834792737430306815
}	

interface twitterUser_content_itemContent_user_results_result_legacy {
	can_dm: boolean															//		true																								true
	can_media_tag: boolean													//		true																								true				
	created_at: string														//		"Mon Oct 04 10:04:46 +0000 2021"																	Sat May 08 01:55:14 +0000 2021
	default_profile: boolean												//		true
	default_profile_image: boolean											//		false
	description: string														//		''
	entities: {
		description: {
			urls: string[]
		}
	}

	fast_followers_count: number											//		0																									0
	favourites_count: number												//		85																									1119
	followed_by: boolean													//		true																								true		true for followed me!!!!!!!!!!!
	followers_count: number													//		126																									507			************************************		126 Followers
	following: boolean														//		true																								true
	friends_count: number													//		274																									1636		************************************		275 Following
	has_custom_timelines: boolean											//		true
	is_translator: boolean													//		false																								false
	listed_count: number													//		0																									4
	location: string														//		""																									"Yau Tsim Mong District" 
	media_count: number														//		16																									59			***********************************
	name: string															//		"Rico Aissat"																						"DDD"		***********************************		USER NAME showing Big
	normal_followers_count: number											//		126																									507			************************************		126 Followers
	pinned_tweet_ids_str: string[]											//		['1826732383296422252']
	possibly_sensitive: boolean												//		false																								false
	profile_banner_url: string												//																											"https://pbs.twimg.com/profile_banners/1390847459824263169/1706808045"
	profile_image_url_https: string											//		"https://pbs.twimg.com/profile_images/1609831996708061184/dIXnZnC9_normal.jpg"						"https://pbs.twimg.com/profile_images/1753106073526177792/iTzCKF_1_normal.jpg"
	profile_interstitial_type: string										//		""
	screen_name: string														//		"RicoAissat"																						"walkerting1"
	statuses_count: number													//		112																									2234
	translator_type: string													//		"none"
	verified: boolean														//		false
	want_retweets: boolean													//		true
	withheld_in_countries: any[]											//		[]

}

interface twitterUser_content_clientEventInfo {
	component: string 														//	"FollowersSgs"
	element: string															//	"user"
}

interface twitterUser_content_itemContent_user_results_result {
	affiliates_highlighted_label: any										//	{}
	has_graduated_access: boolean											//	true
	id: string																//
	is_blue_verified: boolean												//	false																blue_verified
	legacy: twitterUser_content_itemContent_user_results_result_legacy
	profile_image_shape: string												//	"Circle"
	rest_id: string															//	1444966599656607751																					1390847459824263169
	tipjar_settings: {														//	{}
		is_enabled: boolean													//																										true
	}
}

interface twitterUser_content_itemContent_user_results {
	result: twitterUser_content_itemContent_user_results_result
}
interface twitterUser_content_itemContent {
	itemType: string												//	"TimelineUser"
	userDisplayType: string											//	"User"
	user_results: twitterUser_content_itemContent_user_results		
}
interface twitterUser_content {
	clientEventInfo: twitterUser_content_clientEventInfo
	entryType: string												//	"TimelineTimelineItem"
	itemContent: twitterUser_content_itemContent
}
interface twitterUser {
	content: twitterUser_content
	entryId: string
	sortIndex: string
}

interface account {
	account: string
	passwd: string
	postAccount: string
}

interface taskPoolObj {
	checkAccount: string
	uuid: string
	result: {
		status: number,
		isInGroup?: boolean
	}
	walletAddress: string
}
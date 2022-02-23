import requests
from bs4 import BeautifulSoup
import re
import argparse
from followtype import FollowType


def data(athlete_id, follow_type, cookie):
    i = 1
    follows=""
    while True:
        URL = 'https://www.strava.com/athletes/{}/follows?type={}&page={}'.format(str(athlete_id),
                                                                                  follow_type, str(i))

        cookies = {'_strava4_session': cookie}

        page = requests.get(URL, cookies=cookies)
        soup = BeautifulSoup(page.content, 'html.parser')
        follow_list = soup.find('ul', class_='following')
        results = follow_list.findAllNext(attrs={"data-athlete-id": re.compile("\d+")})

        if len(results) == 0:
            break
        for result in results:
            avatar = result.find("div", class_="avatar")
            if avatar is not None:
                print(result['data-athlete-id'], avatar['title'])
                follows += result['data-athlete-id'] + "\n"
        # print result['data-athlete-id'] , avatar['title'].encode('utf-8')
        i = i + 1
    
    with open("output.txt", "w") as text_file:
        text_file.write(follows)



parser = argparse.ArgumentParser()
parser.add_argument("-a", "--athleteid", help="strava athlete id", type=int, required=True)
parser.add_argument("-c", "--cookie", help="strava session id", type=str, required=True)
parser.add_argument("-s", "--followtype", help="following or followers", required=True, type=FollowType.argparse,
                    choices=list(FollowType))

args = parser.parse_args()
data(args.athleteid, args.followtype, args.cookie)

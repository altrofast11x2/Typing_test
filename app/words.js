export const words = {
  ko: [
    '사과','바나나','자동차','컴퓨터','학교','도서관','음악','영화','여행','음식',
    '하늘','바다','산','강','나무','꽃','구름','별','달','태양',
    '사람','친구','가족','사랑','행복','시간','공간','생각','마음','꿈',
    '공부','게임','스포츠','요리','독서','음악','그림','사진','글쓰기','춤',
    '서울','부산','인천','대구','광주','대전','울산','수원','창원','성남',
    '봄','여름','가을','겨울','아침','저녁','오늘','내일','어제','지금',
    '빠르다','느리다','크다','작다','좋다','나쁘다','새롭다','오래되다','밝다','어둡다',
    '먹다','마시다','자다','걷다','달리다','보다','듣다','말하다','쓰다','읽다',
  ],
  en: [
    'apple','banana','cherry','dragon','elephant','forest','guitar','harbor','island','jungle',
    'kitten','lemon','mango','nature','ocean','planet','queen','rabbit','silver','tiger',
    'under','violet','winter','xray','yellow','zipper','about','brave','cloud','dance',
    'earth','flame','ghost','horse','index','jewel','knife','light','magic','night',
    'orbit','paper','quick','river','stone','table','urban','voice','water','extra',
    'young','zebra','alpha','below','cabin','depth','enter','first','green','human',
    'input','joint','knock','laser','month','novel','opera','pixel','quest','radio',
    'solar','truck','ultra','valid','wheat','xenon','yacht','zonal','break','cycle',
  ],
}

export function getWords(lang, count = 30) {
  const pool = [...words[lang]]
  const result = []
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * pool.length)
    result.push(pool[idx])
  }
  return result
}

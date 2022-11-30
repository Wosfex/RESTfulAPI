# RESTfulAPI
Project worked on in participation of a Web Development course at the University of St. Thomas. The goal of this project is to build a RESTful web server by implementing API routes relating to the data.

________________________________________________________________________________________________________________________________________________________________________________________________________________

//Code to Run CURL 

http://localhost:8000/new-incident?case_number=12,date=2014-08-04,time=05:00:00,code=641,incident=Murder,police_grid=33,neighborhood_number=5,block=21Jump_St

curl -X PUT "http://localhost:8000/new-incident" -H "Content-Type: application/json" -d "{\"case_number\": \"13\", \"date\": \"2014-08-04\", \"time\": \"05:00:00\", \"code\": \"641\", \"incident\": \"Murder\", \"police_grid\": \"33\", \"neighborhood_number\": \"5\", \"block\": \"21_Jump_St\"}"
curl -X DELETE "http://localhost:8000/remove-incident" -H "Content-Type: application/json" -d "{\"case_number\": \"13\"}"
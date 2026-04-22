from analyzer import SentimentAnalyzer
from models import Feedback
from time import sleep

ia = SentimentAnalyzer()

print("Welcome to the customer feedback analysis system!\n")

limit = 3
counter = 0 

while counter < limit:
    user_input = input("Please, enter your feedback (or type 'exit' to finish): ")
    if user_input.lower() == 'exit':
        break

    valid_user_id = False
    while not valid_user_id:
        id_input = input("Please, enter your user ID (numeric): ")

        if id_input.isdigit():
            id_num = int(id_input)

            existing_ids = [f.user_id for f in ia.historical_analysis]

            if id_num in existing_ids:
                print("Error: This user ID has already in use! Please choose a different one.")
            else:
                valid_user_id = True

        else:
            print("Invalid user ID. Please enter a numeric value.")
            continue

        print("Beginning the analysis of customer feedback...\n")
        sleep(2)

        new_client = Feedback(user_input, id_num)
        ia.analyse(new_client)
        print("Analysis completed for the current feedback.\n")

        counter += 1

print(ia.generate_report())

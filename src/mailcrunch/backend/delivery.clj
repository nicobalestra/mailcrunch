(ns mailcrunch.backend.delivery
  (:require [mailcrunch.backend.db :as db]
            [korma.core :as kc]))

(kc/defentity delivery)

(defn get-deliveries 
	([]         (do 
								(println "Call to get delivery with no args") 
								(kc/select delivery)))
	([the-query]    (do
									(println "Call to get-deliveries with query " the-query)
							  	(println "Tpe of query " (type the-query))
							(kc/select delivery 
									(kc/where the-query))
								)))

(defn count-delivery 
  ([] (kc/select (db/q-number-of delivery)))
	([query] (kc/select (db/q-number-of delivery query))))

(get-deliveries {:id 19})
  





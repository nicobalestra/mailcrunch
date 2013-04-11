(ns mailcrunch.backend.delivery
  (:require [mailcrunch.backend.db :as db]
            [korma.core :as kc]))


(kc/defentity ent-delivery
		(kc/table :delivery)
		(kc/prepare (db/insert-triggers ent-delivery)))

(defn get-deliveries 
	([] (kc/select ent-delivery))
	([the-query] (kc/select ent-delivery 
									(kc/where the-query))))

(defn count-delivery 
  ([] (kc/select (db/q-number-of ent-delivery)))
	([query] (kc/select (db/q-number-of ent-delivery query))))


(defn update-delivery [delivery]
	(kc/update ent-delivery
						 (kc/set-fields delivery)
						 (kc/where {:id (delivery :id)})))


(defn insert-delivery [delivery]
	(kc/insert ent-delivery
						 (kc/values delivery)
						 (kc/where {:id (delivery :id)})))
							
							
							(insert-delivery {:subject "TEST2" :from_email_address "gino"})
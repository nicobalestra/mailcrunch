(ns mailcrunch.backend.delivery
  (:require [mailcrunch.backend.db :as db]
            [korma.core :as kc]))

(kc/defentity ent-delivery
		(kc/table :delivery)
		(kc/prepare (fn [values]
								 (let [seq-name (str "delivery_userdef")
											 query    (str "select nextval('public." seq-name "'::text)")
											 curr_userdef-id (:userdef_id values)]
									 (if (nil? curr_userdef-id)
										 (let [[{:keys [nextval]}]	 (kc/exec-raw query :results)]
											(assoc values :userdef_id nextval))
										 values)))))

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
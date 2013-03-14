(ns mailcrunch.backend.db
  (:use     [korma.db :only [defdb postgres]])
  (:require [korma.core :as kc]))

(defdb prod (postgres {:db "mailcrunch"
                       :user "mailcrunch"
                       :password "n1c013tt0."
                       :delimiters ""}))


(defmacro q-number-of [table-ref & query]
  `(let [basetmp# (-> (kc/select* ~table-ref)
                      (kc/aggregate (~'count :*) :count))]
    (if ~query
       (-> basetmp#
            (kc/where (first ~@query)))
      basetmp#)))

(defmacro q-get [table-ref & query]
  `(let [basetmp# (kc/select* ~table-ref)]
     (cond-> basetmp#
             (not (empty? ~query)) (kc/where (first ~@query)))))


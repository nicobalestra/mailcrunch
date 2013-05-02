(ns mailcrunch.engine.email
        (:require [clojurewerkz.quartzite.scheduler :as qs]
                  [clojurewerkz.quartzite.jobs      :as j ]
                  [clojurewerkz.quartzite.triggers  :as t ]
                  [clj-time.core :as jt])
        (:use [clojurewerkz.quartzite.jobs :only [defjob]]
              [clojurewerkz.quartzite.schedule.simple :only [schedule with-interval-in-milliseconds with-repeat-count]]))


;(defn build-message [delivery])

;(defn send-delivery [id]
;	(let [delivery (first (db/get-deliveries {:id id}))
;				email  {:from (:from_email_address delivery)
;                                                       :to ["nicobalestra@gmail.com"]
;                                                       :subject (:subject delivery)
;                                                       :body [{:type (build-type "text/html")
;                                                                                         :content (:body_html delivery)}]
;                                                       :X-tra "test extra"
;                                                }]
;		(p/send-message email)
;		(db/update-delivery {:id id :sent true})
;		))

(defjob ProcessDeliveryJob
  [ctx]
  (println "Starting th job SendDelivery at " (jt/now))
  (Thread/sleep 40000)
  (println "Delivery execution completed " (jt/now)))

(defn- build-recipient-list [delivery]
  (printl "for now don't do anything. Just return the delivery passed..")
  delivery)

(defn- build-trigger [delivery-id]
   (t/build
    (t/with-identity (t/key (str "triggers." delivery-id)))
    (t/start-at schedule-date)
    (t/with-schedule (schedule
                      (with-interval-in-milliseconds 200))))  )

(defn- build-job [delivery-id]
  (j/buildq
   (j/of-type ProcessDeliveryJob)
   (j/using-job-data {"delivery-id" delivery-id})
   (j/with-identity (j/key (str "jobs.delivery." delivery-id)))))

(defn kick-off-delivery
  "Kick off a delivery NOW or at the given date. Once the date (whatever it is) ticks a Job should start sending the emails to the recipients
specified in the recipient list."
        ([delivery]
         (kick-off-delivery delivery (jt/now)))
        ([delivery schedule-date]
           (let [recipients (build-recipient-list delivery)
                                        ;in theory for each recipient in the recipient list
                                        ;I should schedule an email
                 id (:id delivery)
                 trigger (build-trigger id)
                 job (build-job id)]
             (println "In kick-off-delivery: Starting job..." (jt/now))
             (let [res (qs/schedule job trigger)]
               (println "In kickoff-delivery: Job ended..." (jt/now))
               res))))

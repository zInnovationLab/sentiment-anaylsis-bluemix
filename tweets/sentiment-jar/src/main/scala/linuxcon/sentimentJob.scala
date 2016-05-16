package linuxcon

import com.typesafe.config.Config
import com.typesafe.config._

import linuxcon.SentimentAnalysisUtils._

import spark.jobserver._
import org.apache.spark.SparkContext
import org.apache.spark.SparkContext._
import org.apache.spark.SparkConf
import org.apache.spark.sql.SQLContext

import org.apache.spark.sql.SQLContext
import org.apache.spark.sql.SQLContext._

// For DataFrame support
import org.apache.spark.sql.types._
import org.apache.spark.sql._
import org.apache.spark.sql.functions._

import scala.collection.mutable.ListBuffer

// JSON parsing
import rapture.io._
import rapture._

// REST calls..only needed if we Alchemy API
import java.io._

object SentimentJob extends SparkSqlJob {
  override def validate(sc: SQLContext, config: Config): SparkJobValidation = SparkJobValid

  // Uses CoreNLP
   def sentimentNLP(string : String) : String = {
     detectSentiment(string).toString
   }

/*
Takes in put JSON array of the following format and return sentiment of the array.
      [
        {"text":"This thing is amazing!", "time":"1"}, 
        {"text":"Wow this sucks didnt expect it to be this bad!", "time":"2"},
        {"text":"Amazing! wow! cool", "time":"2"}
      ]
*/

 def runJob(sqlContext: SQLContext, config: Config): Any = {
    println(" **************** \n\n" + config + "\n\n ****************")

	val searchTerm = config.getString("input.string") //.replaceFirst("tweets",""""tweets"""").replaceFirst("text: ",""""text":"""").replaceFirst("""}]}""",""""}]}""")

    println(" **************** \n\n" + searchTerm + "\n\n ****************")

    val sentimentJSON : Json = Json.parse(searchTerm)
    var sentimentMap = scala.collection.mutable.ListBuffer[String]()
    for (i <- 0 until sentimentJSON.tweets.length )
      sentimentMap += (sentimentJSON.tweets(i).text.toString)

    val sentimentRDD = sentimentMap.map(x => (x, sentimentNLP(x)))

    var sentimentDF = sqlContext.createDataFrame(sentimentRDD).withColumnRenamed("_1", "text").withColumnRenamed("_2", "sentiment") 
    '['+ sentimentDF.toJSON.collect.mkString(",") + ']'
  }
}

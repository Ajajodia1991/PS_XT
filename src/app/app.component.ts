import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ChartDataSets, ChartOptions, Chart } from 'chart.js';
import { Color } from 'ng2-charts';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  @ViewChild('canvas') canvas: ElementRef;

  itemsPerPage: number;
  totalItems: any;
  previousPage: any;
  public pageNum = 0;
  public pageSize = 20;
  public collectionSize = 20;
  public hackerList: any[];

  public lineChartLabels = [];
  voteCounts: any = [];
  public Linechart;  
  mySubscription: any;

  constructor(private httpClient: HttpClient,
    private elementRef: ElementRef,
    private router: Router) { }

  ngOnInit(): void {
    if(!sessionStorage.getItem('hackNewsList')){
    this.loadData(this.pageNum);
    }
  }

  /**
   * Service call to get hacker News List
   * @param {*} page
   * @memberof AppComponent
   */
  loadData(page) {
    const url = `https://hn.algolia.com/api/v1/search?tags=front_page&page=${page}`;
    this.httpClient.get(url).subscribe((data: any) => {
      this.hackerList = data && data.hits;
      sessionStorage.setItem('hackNewsList', JSON.stringify(this.hackerList));
      this.getMapData();
    });
  }

  /**
   * Method to Hide a selected record
   * @param {*} rowIndex
   * @memberof AppComponent
   */
  hideRow(rowIndex){
    this.hackerList.splice(rowIndex,1);
    sessionStorage.setItem('hackNewsList', JSON.stringify(this.hackerList));
    this.getMapData();
  }

  loadPage(page: number) {
    this.lineChartLabels = [];
    this.voteCounts = [];
    if (page !== this.previousPage && !sessionStorage.getItem('hackNewsList')) { 
      this.previousPage = page;
      this.loadData(this.previousPage-1);
    } else {
      this.hackerList = JSON.parse(sessionStorage.getItem('hackNewsList'));
      this.getMapData();
    }
  }

  /**
   * Get Chart data display
   * @memberof AppComponent
   */
  getMapData(){
    this.lineChartLabels = [];
    this.voteCounts = [];
    this.hackerList.forEach(item => {
      this.lineChartLabels.push(item.objectID)
      this.voteCounts.push(item.points)
    });
    let htmlRef = this.elementRef.nativeElement.querySelector(`#canvas`);
    this.Linechart = new Chart(htmlRef, {
      type: 'line',  
      data: {  
        labels: this.lineChartLabels,  
        datasets: [  
          {  
            data: this.voteCounts,  
            borderColor: '#3cb371'
          }  
        ]  
      },  
      options: {
        responsive: true,  
        legend: {  
          display: false  
        },  
        scales: {
          xAxes: [{  
            display: true,
            scaleLabel: {
              labelString : 'ID'
            } 
          }
        ],  
          yAxes: [{  
            display: true,
            scaleLabel: {
              labelString : 'Votes'
            }   
          }],  
        }  
      }  
    });

  }

  /**
   * Method to Up Vote
   * @param {*} selectedRow
   * @memberof AppComponent
   */
  upVote(selectedRow){
    this.hackerList[selectedRow].points = this.hackerList[selectedRow].points + 1;
    sessionStorage.setItem('hackNewsList', JSON.stringify(this.hackerList));
    this.getMapData();
  }

  /**
   * Method to get difference in hours
   * @param {*} created_at
   * @returns
   * @memberof AppComponent
   */
  calculateDiffHours(created_at) {
    var diff = (new Date(created_at).getTime() - new Date().getTime()) / 1000;
    diff /= (60 * 60);
    return Math.abs(Math.round(diff));
  }
}

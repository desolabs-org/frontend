import { Component, OnInit } from '@angular/core';
import { RouteNames } from '../../app-routing.module';
import { GlobalVarsService } from '../../global-vars.service';
import { BackendApiService } from '../../backend-api.service';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'landing-page',
  templateUrl: './landing-page.component.html',
})
export class LandingPageComponent implements OnInit {
  RouteNames = RouteNames;
  environment = environment;

  featuredPosts = [
    {
      name: 'kanshi',
      pic:
        'https://node.desolabs.org/api/v0/get-single-profile-picture/BC1YLhwpmWkgk2iM9yTSxzgUVhYjgessSPTiVHkkK9pMrhweqJnWrvK',
      text: 'Hello world! Wen moon?',
      when: '4h',
      comments: '25',
      reposts: '18',
      likes: '42',
      liked: true,
      reposted: true,
    },
    {
      name: 'SLAVA',
      pic:
        'https://node.desolabs.org/api/v0/get-single-profile-picture/BC1YLj766XEzYFsv3wQdh8Xi2E5tmy4gY1yVBN9g5h73cm7PMRXKbFU',
      text: "GoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoD Beautiful Morning De$o!!!!!",
      when: '20h',
      comments: '23',
      reposts: '14',
      likes: '13',
      liked: true,
    },
    {
      name: 'mashelenn',
      pic:
        'https://node.desolabs.org/api/v0/get-single-profile-picture/BC1YLgo6QYnGzGDVEbcs8fAcuJAHxMBHRJNABMbpnhexkvANKzsMZHq',
      text: 'The result does not depend on the number of working days in the year. The result depends on the number of right decisions and actions.',
      when: '1d',
      comments: '14',
      reposts: '12',
      likes: '23',
    },
    {
      name: 'SeanSlater',
      pic:
        'https://node.desolabs.org/api/v0/get-single-profile-picture/BC1YLirtb7CjNwVmWEt7t1487Qpo4LoPBDEGvfqYwXXZcj2dDLNMBVU',
      text:
        "Seeing a flurry of commits to the DeSo code - looking forward to the next few releases, always exciting when new things are coming!",
      when: '2d',
      comments: '22',
      reposts: '61',
      likes: '136',
    },
    {
      name: 'znmead',
      pic:
        'https://node.desolabs.org/api/v0/get-single-profile-picture/BC1YLhhdmDEy6TqsRAmWuQazjeQVAW2HuMDH3sNe8Cp6tVKZXvwibSg',
      text: 'Happy New Moon. Set your intentions, Rabbits.',
      when: '2d',
      comments: '82',
      reposts: '11',
      likes: '136',
    },
  ];


  constructor(public globalVars: GlobalVarsService, private router: Router, private backendApi: BackendApiService) {}

  ngOnInit() {

  }
}

import React, { useState, useEffect } from 'react';
import emailjs from 'emailjs-com';
import './App.css';


function App() {
  const [location, setLocation] = useState('');
  const [email, setEmail] = useState('');
  const [result, setResult] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);

  const apiKey = '83d4354d81629ce2dc116109948606bb';

  <div><History Dashboard /></div>

  // ✅ Move emailjs.init to useEffect
  useEffect(() => {
    emailjs.init('NprOiXjjb5I7JW0-Z');
  }, []);

  const detectLocation = () => {
    setLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`
            );
            const data = await response.json();
            setLocation(data.name);
            setLoadingLocation(false);
          } catch (error) {
            setResult('❌ Failed to detect location.');
            setLoadingLocation(false);
          }
        },
        () => {
          setResult('❌ Location access denied.');
          setLoadingLocation(false);
        }
      );
    } else {
      setResult('❌ Geolocation is not supported by your browser.');
      setLoadingLocation(false);
    }
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleClick = async () => {
    if (!location || !email) {
      setResult('❌ Please enter both a city name and a valid email address.');
      return;
    }

    if (!isValidEmail(email)) {
      setResult('❌ Invalid email format. Please enter a valid email.');
      return;
    }

    await getWeather(location, email);
  };

  const getWeather = async (location, email) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`
      );
      const data = await response.json();

      if (data.cod === 200) {
        const weather = data.weather[0].main;
        const temp = data.main.temp;

        let alertMessage = '';
        if (weather.toLowerCase().includes('rain')) {
          alertMessage = `🌧️ Rain Alert: It's raining in ${location}. Current temperature: ${temp}°C.`;
        } else {
          alertMessage = `☀️ No Rain: The weather in ${location} is ${weather}. Current temperature: ${temp}°C.`;
        }

        sendEmail(email, location, alertMessage);
        setResult(alertMessage);
      } else {
        setResult(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      setResult('❌ Unable to fetch weather data. Please try again.');
    }
  };

  const sendEmail = (email, location, alertMessage) => {
    const emailParams = {
      to_email: email,
      location: location,
      alert_message: alertMessage,
    };

    emailjs
      .send('service_e46stqn', 'template_eximsrd', emailParams)
      .then(() => {
        console.log('✅ Email sent successfully!');
      })
      .catch((error) => {
        console.error('❌ Error sending email:', error);
      });
  };

  return (
    <div className="container">
      <h1>Rain Alert System</h1>
      <p>Enter your location to get weather alerts and receive notifications via email:</p>
      <input
        type="text"
        placeholder="Enter City Name"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <input
        type="email"
        placeholder="Enter Your Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <div style={{display: 'flex',justifyContent: 'center',gap: '15px',marginTop: '20px'}}>
      <button onClick={handleClick}>Get Weather Alert</button>
      <button onClick={detectLocation} disabled={loadingLocation}>
      {loadingLocation ? 'Detecting Location...' : 'Use My Current Location'}
      </button>
      </div>

      <div id="result" style={{ marginTop: '20px' }}>{result}</div>
    </div>
  );
}

export default App;